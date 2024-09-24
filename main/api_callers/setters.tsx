import { BASE_URL } from "./constants";

export async function sendMessage(user_id: string, session_id: string, message: string): Promise<any> {
    const body = {
        user_id: user_id,
        session_id: session_id,
        message: message
    };

    try {
        const apiUrl = `${BASE_URL}/send_message`;
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Return the response data
        return data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}
