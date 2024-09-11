import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db'; // Adjust this path as needed
import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { ChatMessageHistory } from '@langchain/community/stores/message/in_memory';

// Set up your model and prompt
const model = new ChatOpenAI({});
const prompt = ChatPromptTemplate.fromMessages([
  ["ai", "You are a helpful assistant"],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

// Create a Runnable and message history store
const runnable = prompt.pipe(model);
const messageHistory = new ChatMessageHistory();

const withHistory = new RunnableWithMessageHistory({
  runnable,
  getMessageHistory: (_sessionId) => messageHistory,
  inputMessagesKey: "input",
  historyMessagesKey: "history",
});

export async function POST(req) {
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Only POST requests are allowed' }), { status: 405 });
  }

  try {
    const { user_id, session_id, message } = await req.json();

    if (!user_id || !session_id || !message) {
      return new NextResponse(JSON.stringify({ error: 'Missing user_id, session_id, or message' }), { status: 400 });
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
    const dbMessages = await db.all(
      'SELECT * FROM messages WHERE session_id = ? AND user_id = ? ORDER BY timestamp ASC',
      session_id,
      user_id
    );

    // Load messages into the LangChain history
    dbMessages.forEach((dbMessage) => {
      if (dbMessage.message_type === 'human_message_no_prompt') {
        messageHistory.addMessage({
          role: 'human',
          content: dbMessage.content,
        });
      } else if (dbMessage.message_type === 'ai_message') {
        messageHistory.addMessage({
          role: 'ai',
          content: dbMessage.content,
        });
      }
    });

    // Generate the AI response using LangChain with memory
    const config = { configurable: { sessionId: session_id } };
    const aiResponse = await withHistory.invoke({ input: message }, config);

    // Insert the new ai message into the database
    await db.run(
        'INSERT INTO messages (user_id, session_id, message_type, content, timestamp) VALUES (?, ?, ?, ?, ?)',
        user_id,
        session_id,
        'aimessage',
        aiResponse.content,
        new Date().toISOString()
        );
    
    const new_db = await db.all(
        'SELECT * FROM messages WHERE session_id = ? AND user_id = ? ORDER BY timestamp ASC',
        session_id,
        user_id
      );
    console.log('db: ', new_db);
    // Return the AI response
    return new NextResponse(JSON.stringify({ ai_response: aiResponse.content }), { status: 200 });
  } catch (error) {
    console.error('Error handling message data:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
