import { BASE_URL } from "./constants";

export async function fetchUserSessions(user_id: string): Promise<any> {
    try {
        const apiUrl = `${BASE_URL}/get_conversations?user_id=${user_id}`
  
        const response = await fetch(apiUrl, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Return the sessions data
        return data;
        } catch (error) {
        console.error("Error fetching sessions:", error);
        throw error;
        }
  }

export async function fetchNextAvailableChatSession(user_id: string): Promise<any> {
    try {
        const apiUrl = `${BASE_URL}/get_available_session?user_id=${user_id}`
  
        const response = await fetch(apiUrl, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Return the sessions data
        return data['next_session_id'];
        } catch (error) {
        console.error("Error fetching sessions:", error);
        throw error;
        }
  }

export async function fetchConversation(user_id: string, session_id: string): Promise<any> {
    try {
        const apiUrl = `${BASE_URL}/get_conversation?user_id=${user_id}&session_id=${session_id}`

        const response = await fetch(apiUrl, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Return the sessions data
        return data['conversation'];
        } catch (error) {
        console.error("Error fetching sessions:", error);
        throw error;
        }
    }

  
  