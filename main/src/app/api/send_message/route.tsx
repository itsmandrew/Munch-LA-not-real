import { NextResponse } from "next/server";
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
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import clientPromise from "@/db/mongodb";

// Type definitions for the request body and database message
interface RequestBody {
  user_id: string;
  session_id: string;
  message: string;
}

interface Message {
  message_type: string;
  content: any;
  timestamp: string;
}

interface RestaurantMetadata {
  address: string;
  name: string;
  rating: number;
  price: string;  // Updated to include price range
  summary: string; // Added summary
}

interface Restaurant {
  pageContent: string;
  metadata: RestaurantMetadata;
  id: string;
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
      "You are a friendly and knowledgeable guide specializing in restaurants in Los Angeles..."
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
  ],
  inputVariables: ["inputText", "history"],
});

const outputParser = new JsonOutputFunctionsParser();
const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

async function upsertConversationMessage(user_id: string, session_id: string, newMessage: Message) {
  const currentTime = new Date().toISOString();

  try {
    const client = await clientPromise;
    const db = client.db("MunchLA");

    // Update or create the user's document and set the last_updated field
    await db.collection("Conversations").updateOne(
      { _id: user_id },
      {
        $set: {
          [`sessions.${session_id}.messages`]: (
            await db.collection("Conversations").findOne({ _id: user_id })
          )?.sessions?.[session_id]?.messages || [],
          [`sessions.${session_id}.last_updated`]: currentTime, // Set last_updated to the current time
        }
      },
      { upsert: true }
    );

    // Update the session with the new message and update the last_updated field
    await db.collection("Conversations").updateOne(
      { _id: user_id },
      {
        $push: { [`sessions.${session_id}.messages`]: newMessage },
        $set: { [`sessions.${session_id}.last_updated`]: currentTime }, // Update last_updated when a new message is added
      },
      { upsert: true }
    );

    console.log("Message inserted or updated successfully");
  } catch (error) {
    console.error("Error inserting or updating message:", error);
  }
}

export async function POST(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    console.time("Total execution time");
    console.time("Parse request body");
    const { user_id, session_id, message }: RequestBody = await req.json();
    console.timeEnd("Parse request body");

    if (!user_id || !session_id || !message) {
      return NextResponse.json(
        { error: "Missing user_id, session_id, or message" },
        { status: 400 }
      );
    }

    console.time("Pinecone similarity search");
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
      { pineconeIndex }
    );
    const results = await vectorStore.similaritySearch(message, 8);
    console.timeEnd("Pinecone similarity search");

    // Insert formatted restaurant data into MongoDB
    console.time("Insert restaurant data into MongoDB");
    const combinedContent = results
      .map((result) => JSON.stringify(result, null, 2))
      .join("\n\n");

    const newMessage: Message = {
      message_type: "restaurant_data",
      content: combinedContent,
      timestamp: new Date().toISOString(),
    };

    // Insert the combined message into MongoDB
    await upsertConversationMessage(user_id, session_id, newMessage);
    console.timeEnd("Insert restaurant data into MongoDB");

    // Retrieve the updated conversation history from MongoDB
    console.time("Retrieve conversation from MongoDB");
    const client = await clientPromise;
    const db = client.db("MunchLA");
    const collection = db.collection("Conversations");
    const conversation = await collection.findOne(
      { _id: user_id },
      { projection: { [`sessions.${session_id}.messages`]: 1 } }
    );
    const dbMessages: Message[] = conversation ? conversation.sessions[session_id]?.messages || [] : [];
    console.timeEnd("Retrieve conversation from MongoDB");

    // Create a new message history instance for the current session
    const messageHistory = new ChatMessageHistory();

    console.time("Load messages into history");
    dbMessages.forEach((dbMessage: Message) => {
      if (dbMessage.message_type === "human_message_no_prompt") {
        messageHistory.addMessage(new HumanMessage(dbMessage.content));
      } else if (dbMessage.message_type === "ai_message" || dbMessage.message_type === "restaurant_data") {
        messageHistory.addMessage(new AIMessage(JSON.stringify(dbMessage.content)));
      }
    });
    console.timeEnd("Load messages into history");

    console.time("Generate AI response");
    const withHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: () => messageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    const config: RunnableConfig = { configurable: { sessionId: session_id } };
    const aiResponse = await withHistory.invoke(
      { inputText: message, history: messageHistory },
      config
    );
    console.timeEnd("Generate AI response");

    console.time("Insert human message into MongoDB");
    const humanMessage: Message = {
      message_type: "human_message_no_prompt",
      content: message,
      timestamp: new Date().toISOString(),
    };
    await upsertConversationMessage(user_id, session_id, humanMessage);
    console.timeEnd("Insert human message into MongoDB");

    console.time("Insert AI message into MongoDB");
    const aiMessage: Message = {
      message_type: "ai_message",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };
    await upsertConversationMessage(user_id, session_id, aiMessage);
    console.timeEnd("Insert AI message into MongoDB");

    console.timeEnd("Total execution time");
    return NextResponse.json({ aiResponse }, { status: 200 });
  } catch (error) {
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
