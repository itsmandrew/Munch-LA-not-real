import { NextResponse } from "next/server";
import { openDb } from "@/db/db";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Database } from "sqlite";

// Type definitions for the request body and database message
interface RequestBody {
  user_id: string;
  session_id: string;
  message: string;
}

interface DBMessage {
  user_id: string;
  session_id: string;
  message_type: string;
  content: string;
  timestamp: string;
}

interface RestaurantMetadata {
  address: string;
  name: string;
  rating: number;
  place_id: string;
}

interface Restaurant {
  pageContent: string;
  metadata: RestaurantMetadata;
  id: string;
}

/**
 * Formats a restaurant object into a well-structured string.
 * @param restaurant - The restaurant object to format.
 * @returns A well-formatted string representation of the restaurant information.
 */
function formatRestaurantInfo(restaurant: Restaurant): string {
  const { pageContent, metadata } = restaurant;

  // Extract metadata
  const { address, name, rating } = metadata;

  // Construct formatted string
  return `
Restaurant Data:

**${name}**

- **Address:** ${address}
- **Rating:** ${rating}
- **Description:** ${pageContent}
  `;
}

// Define the Zod schema for the structured output
const restaurantSchema = z.object({
  general_response: z
    .string()
    .describe("A general response from the bot to the user"),
  restaurants: z
    .array(
      z.object({
        name: z.string().describe("The name of the restaurant"),
        address: z.string().describe("The address of the restaurant"),
        rating: z.number().describe("The rating of the restaurant"),
        price: z.string().describe("The price range of the restaurant"),
        summary: z.string().describe("A summary of reviews for the restaurant"),
      })
    )
    .describe("An array of restaurant objects with detailed information"),
});

// Set up your model and prompt
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
});

// Bind the model with function calling
const functionCallingModel = model.bind({
  functions: [
    {
      name: "output_formatter",
      description: "Format output to structured JSON",
      parameters: zodToJsonSchema(restaurantSchema),
    },
  ],
  function_call: { name: "output_formatter" },
});

// Create an improved prompt template to handle contextual conversations
const prompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      "You are a friendly and knowledgeable guide specializing in restaurants in Los Angeles. Your primary role is to help users with their queries, " +
        "especially those related to food, dining experiences, and specific restaurants. When responding to user messages, please adhere to the following guidelines: " +
        "\n\n1. **Maintain Conversational Context**: If the user asks a follow-up question or gives a brief response (e.g., 'yes', 'tell me more'), continue the conversation naturally based on the context. " +
        "Do not switch topics unless explicitly instructed. Avoid fetching new information unless required by the user. " +
        "\n\n2. **Populate Restaurant Information Judiciously**: Only include detailed information about restaurants (name, address, rating, price, and review summary) " +
        "in the 'restaurants' field if the user's query explicitly asks for it, such as asking for recommendations, details about a restaurant, or comparing multiple dining options. " +
        "If the user's message is not directly related to obtaining restaurant information, only fill the 'general_response' field with a relevant and thoughtful reply." +
        "\n\n3. **Utilize the Vector Database Appropriately**: If drawing information from the vector database, ensure it enhances the conversation or answers a specific user query. " +
        "Avoid using vector-based information when it is unrelated to the immediate context of the conversation or when the user expects a continuation of the current discussion. " +
        "\n\n4. **Prompt Thoughtful Responses**: For unrelated or ambiguous queries, suggest interesting food topics, new restaurants to try, or ask about the user's favorite dining experiences."
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
  ],
  inputVariables: ["inputText", "history"],
  outputVariables: ["general_response", "restaurants"],
});

const outputParser = new JsonOutputFunctionsParser();

const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

export async function POST(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    const { user_id, session_id, message }: RequestBody = await req.json();
    const pinecone = new Pinecone();

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
      { pineconeIndex }
    );
    // Perform the similarity search
    const results = await vectorStore.similaritySearch(message, 8);
    const formattedResults: string[] = results.map((result) =>
      formatRestaurantInfo(result)
    );

    if (!user_id || !session_id || !message) {
      return NextResponse.json(
        { error: "Missing user_id, session_id, or message" },
        { status: 400 }
      );
    }

    // Open SQLite database
    const db = await openDb();

    for (const result of formattedResults) {
      await db.run(
        "INSERT INTO messages (user_id, session_id, message_type, content, timestamp) VALUES (?, ?, ?, ?, ?)",
        user_id,
        session_id,
        "restaurant_data",
        result,
        new Date().toISOString()
      );
    }

    // Insert the new message into the database
    await db.run(
      "INSERT INTO messages (user_id, session_id, message_type, content, timestamp) VALUES (?, ?, ?, ?, ?)",
      user_id,
      session_id,
      "human_message_no_prompt",
      message,
      new Date().toISOString()
    );

    // Retrieve the updated conversation history from the database
    const dbMessages: DBMessage[] = await db.all(
      "SELECT * FROM messages WHERE session_id = ? AND user_id = ? ORDER BY timestamp ASC",
      session_id,
      user_id
    );

    console.log(dbMessages);

    // Create a new message history instance for the current session
    const messageHistory = new ChatMessageHistory();
    // Load messages into the LangChain history using specific message types
    dbMessages.forEach((dbMessage: DBMessage) => {
      if (
        dbMessage.message_type === "human_message_no_prompt" ||
        dbMessage.message_type === "restaurant_data"
      ) {
        messageHistory.addMessage(new HumanMessage(dbMessage.content));
      } else if (dbMessage.message_type === "ai_message") {
        messageHistory.addMessage(new AIMessage(dbMessage.content));
      }
    });

    const withHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: () => messageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    // Generate the AI response using LangChain with memory
    const config: RunnableConfig = { configurable: { sessionId: session_id } };
    const aiResponse = await withHistory.invoke(
      { inputText: message, history: messageHistory },
      config
    );
    // Insert the new AI message into the database
    await db.run(
      "INSERT INTO messages (user_id, session_id, message_type, content, timestamp) VALUES (?, ?, ?, ?, ?)",
      user_id,
      session_id,
      "ai_message",
      aiResponse,
      new Date().toISOString()
    );

    return NextResponse.json({ aiResponse }, { status: 200 });
  } catch (error) {
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
