import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

// Type definitions for AI message content and message
interface AIMessageContent {
  general_response: string;
  restaurants: any[]; // Replace `any` with the appropriate type if available
}

interface Message {
  message_type: string;
  content: string | AIMessageContent;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  // Check if the user is authenticated
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    // CORS headers
    const res = NextResponse.next();
    res.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
    res.headers.set("Access-Control-Allow-Methods", "GET");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res;
    }

    // Ensure only GET requests are processed
    if (req.method !== "GET") {
      return NextResponse.json(
        { error: "Method Not Allowed" },
        { status: 405 }
      );
    }

    // Parse query parameters from the URL
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const session_id = searchParams.get("session_id");

    // Validate that user_id and session_id are provided
    if (!user_id || !session_id) {
      return NextResponse.json(
        { error: "Missing user_id or session_id" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Retrieve the conversation history using Mongoose and use `.lean()` to return a plain JS object
    const conversation = await Conversation.findOne(
      { _id: user_id },
      { [`sessions.${session_id}.messages`]: 1 }
    ).lean();

    console.log('here', conversation);

    if (
      !conversation ||
      !conversation.sessions ||
      !conversation.sessions[session_id] // Change to array/object syntax with `.lean()`
    ) {
      return NextResponse.json(
        { error: "No conversation history found" },
        { status: 404 }
      );
    }

    // Extract messages from the session
    const messages: Message[] = conversation.sessions[session_id].messages;

    // Filter and transform messages based on the type
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
        return undefined; // Ensure we always return a value
      })
      .filter((message): message is Message => message !== undefined); // Filter out any undefined values

    // Return the filtered conversation
    return NextResponse.json(
      { conversation: filteredMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching conversation data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
