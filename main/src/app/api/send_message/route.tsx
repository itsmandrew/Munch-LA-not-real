import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts';
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { JsonOutputFunctionsParser } from "langchain/output_parsers";

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


// Define the Zod schema for the structured output
const restaurantSchema = z.object({
  general_response: z.string().describe("A general response from the bot to the user"),
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

// Create the prompt template
const prompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      "Extract and list information about restaurants from the following text. Include name, address, rating, price, and a summary of reviews for each restaurant. If the user's message has nothing to do with the restaurants/food, then you can just leave the restaurants list blank and just have the general_response field filled."
    ),
    new MessagesPlaceholder("history"), // This is where the history will be inserted
    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
  ],
  inputVariables: ["inputText", "history"],
});

const outputParser = new JsonOutputFunctionsParser();

const chain = prompt.pipe(functionCallingModel).pipe(outputParser);
// const runnable = prompt.pipe(model);

export async function POST(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Only POST requests are allowed' }, { status: 405 });
  }

  try {
    const { user_id, session_id, message }: RequestBody = await req.json();

    if (!user_id || !session_id || !message) {
      return NextResponse.json({ error: 'Missing user_id, session_id, or message' }, { status: 400 });
    }

    // Open SQLite database
    const db = await openDb();

    // Insert the new message into the database
    await db.run(
      'INSERT INTO messages (user_id, session_id, message_type, content, timestamp) VALUES (?, ?, ?, ?, ?)',
      user_id,
      session_id,
      'human_message_no_prompt',
      message,
      new Date().toISOString()
    );

    // Retrieve the updated conversation history from the database
    const dbMessages: DBMessage[] = await db.all(
      'SELECT * FROM messages WHERE session_id = ? AND user_id = ? ORDER BY timestamp ASC',
      session_id,
      user_id
    );
    
    // Create a new message history instance for the current session
    const messageHistory = new ChatMessageHistory();
    // Load messages into the LangChain history using specific message types
    dbMessages.forEach((dbMessage: DBMessage) => {
      if (dbMessage.message_type === 'human_message_no_prompt') {
        messageHistory.addMessage(new HumanMessage(dbMessage.content));
      } else if (dbMessage.message_type === 'ai_message') {
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
    const aiResponse = await withHistory.invoke({ inputText: message, history: messageHistory }, config);
    // Insert the new AI message into the database
    await db.run(
      'INSERT INTO messages (user_id, session_id, message_type, content, timestamp) VALUES (?, ?, ?, ?, ?)',
      user_id,
      session_id,
      'ai_message',
      aiResponse,
      new Date().toISOString()
    );

    return NextResponse.json({ aiResponse }, { status: 200 });
  } catch (error) {
    console.error('Error handling message data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
