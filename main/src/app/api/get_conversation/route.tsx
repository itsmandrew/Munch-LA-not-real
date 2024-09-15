// Call this whenever the user clicks on a conversation, this will load that conversation

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/db/mongodb";

interface AIMessageContent {
  general_response: string;
  restaurants: any[]; // Replace `any` with the appropriate type if available
}

interface Message {
  message_type: string;
  content: string | AIMessageContent;
}

interface RequestBody {
  user_id: string;
  session_id: string;
}


export async function POST(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    // Parse query parameters
    const { user_id, session_id }: RequestBody = await req.json();

    if (!user_id || !session_id) {
      return NextResponse.json(
        { error: "Missing user_id or session_id" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("MunchLA");
    const collection = db.collection("Conversations");

    // Retrieve the conversation history from MongoDB
    const conversation = await collection.findOne(
      { _id: user_id },
      { projection: { [`sessions.${session_id}.messages`]: 1 } }
    );

    if (!conversation || !conversation.sessions || !conversation.sessions[session_id]) {
      return NextResponse.json(
        { error: "No conversation history found" },
        { status: 404 }
      );
    }

    const messages: Message[] = conversation.sessions[session_id].messages;

    // Filter and transform messages
    const filteredMessages: Message[] = messages
      .filter(
        (message: any) =>
          message.message_type === "human_message_no_prompt" ||
          message.message_type === "ai_message"
      )
      .map((message: any) => {
        if (message.message_type === "human_message_no_prompt") {
          return {
            message_type: "human_message_no_prompt",
            content: message.content,
          };
        } else if (message.message_type === "ai_message") {
          return {
            message_type: "ai_message",
            content: {
              general_response: message.content.general_response || "",
              restaurants: message.content.restaurants || [],
            },
          };
        }
        // Ensuring all cases return a value
        return undefined;
      })
      .filter((message): message is Message => message !== undefined); // Filter out any undefined values


    // Return the filtered conversation
    return NextResponse.json({ conversation: filteredMessages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversation data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}