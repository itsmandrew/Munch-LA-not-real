// Should call this when the page first loads up
// Since it'll be the new message screen, you want to make sure you're getting the next available sessions

import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/db/mongodb";

interface RequestBody {
  user_id: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    const { user_id }: RequestBody = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("MunchLA"); // Replace with your actual database name
    const collection = db.collection("Conversations");

    // Retrieve the user document to get the current sessions
    const userDocument = await collection.findOne({ _id: user_id });
    

    let nextSessionId = 1;
    if (userDocument && userDocument.sessions) {
      // Get the existing session IDs as numbers
      const sessionIds = Object.keys(userDocument.sessions).map(Number);
      console.log('ids', sessionIds);

      // Find the first missing session_id starting from 1
      while (sessionIds.includes(nextSessionId)) {
        nextSessionId++;
      }
    }

    // Return the next available session ID
    return NextResponse.json(
      { next_session_id: nextSessionId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching next session ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
