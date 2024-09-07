// src/app/components/api/api.js

const API_BASE_URL = 'http://127.0.0.1:8000/api/';


// Function to get data from an endpoint
export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    console.log('AI Response from fetchData:', responseData);  // Log the response from ChatGPT
    return responseData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Function to post data to an endpoint
export async function postData(endpoint, data) {
    console.log('data: ', data);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const responseData = await response.json();
    console.log('postData:', responseData);  // Log the response from ChatGPT
    return responseData;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
}

// Function to post data to an endpoint
export async function getSessions(endpoint, user_id) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user_id), // Ensure payload is correctly formatted
    });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await response.json();
      return responseData;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
}

// Function to post data to an endpoint
export async function getConversation(endpoint, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await response.json();
      return responseData;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
}

// Function to post data to an endpoint
export async function getNewSession(endpoint, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), 
    });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await response.json();
      return responseData;
  } catch (error) {
    console.error('Error posting data:', error);
    throw error;
  }
}