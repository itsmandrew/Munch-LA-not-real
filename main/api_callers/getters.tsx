import { BASE_URL } from "./constants";

export default async function fetchUserSessions(user_id: string): Promise<any> {
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
        console.log('sessions', data);

        // Return the sessions data
        return data;
        } catch (error) {
        console.error("Error fetching sessions:", error);
        throw error;
        }
  }
  