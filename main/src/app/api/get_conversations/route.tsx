import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

// Type definitions for the session preview
interface Session {
  session_id: string;
  conversation_preview: string;
  last_updated: string;
}

export async function GET(req: Request): Promise<Response> {
  try {
    // Get the URL and search parameters
    const { searchParams } = new URL(req.url);

    // Retrieve the user_id from the query parameters
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id query parameter is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Retrieve the user document to get the current sessions using `.lean()`
    const userDocument = await Conversation.findOne({ _id: user_id }).lean(); // <-- Add `.lean()` here

    if (!userDocument || !userDocument.sessions) {
      return NextResponse.json(
        { error: "No sessions found for this user" },
        { status: 404 }
      );
    }


    // Process each session to return the session_id and the general_response as the conversation_preview
    const sessions: Session[] = [];
    Object.entries(userDocument.sessions).forEach(([sessionId, sessionData]: [string, any]) => {
      // Extract the general_response from the message preview
      const generalResponse = sessionData.messages?.find(
        (msg: any) => msg.message_type === "ai_message"
      )?.content.general_response || "No AI messages yet";

      // Push the session details into the sessions array
      sessions.push({
        session_id: sessionId,
        conversation_preview: generalResponse,
        last_updated: sessionData.last_updated || new Date().toISOString(),
      });
    });

    // Sort the sessions by last_updated, newest first
    sessions.sort((a: Session, b: Session) =>
      new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );

    // Return the list of sessions with their conversation previews
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
