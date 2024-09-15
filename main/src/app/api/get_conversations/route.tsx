import { NextResponse } from "next/server";
import clientPromise from "@/db/mongodb";

// Type definitions for the request body and session preview
interface RequestBody {
  user_id: string;
}

interface Session {
  session_id: string;
  conversation_preview: string;
  last_updated: string;
}

export async function POST(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    const { user_id }: RequestBody = await req.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("MunchLA");
    const collection = db.collection("Conversations");

    // Retrieve the user document to get the current sessions
    const userDocument = await collection.findOne({ _id: user_id });

    if (!userDocument || !userDocument.sessions) {
      return NextResponse.json(
        { error: "No sessions found for this user" },
        { status: 404 }
      );
    }

    // Process each session to return the session_id and the general_response as the conversation_preview
    const sessions: Session[] = Object.entries(userDocument.sessions)
      .map(([sessionId, sessionData]: [string, any]) => {

        // Extract the general_response from the message preview
        const generalResponse = sessionData.messages?.find(
          (msg: any) => msg.message_type === "ai_message"
        )?.content.general_response || "No AI messages yet";

        // Return the session_id, conversation_preview, and last_updated timestamp
        return {
          session_id: sessionId,
          conversation_preview: generalResponse,
          last_updated: sessionData.last_updated || new Date().toISOString(),
        };
      })
      // Sort the sessions by last_updated, newest first
      .sort((a: Session, b: Session) =>
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
