// src/utils/gemini2.js
export async function getGeminiResponse2(promptText) {
  const apiKey = 'AIzaSyDovVJXsZezpyPMeoE3jAgcLwudmPXeJ6A';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: promptText,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Extracting the reply content from the response
    if (data.candidates && data.candidates.length > 0) {
      const reply = data.candidates[0].content;
      const replyText = reply.parts[0].text;
      return replyText;
    } else {
      console.log('No reply found.');
      return '[]';
    }
  } catch (error) {
    console.error('Error fetching response from Gemini:', error);
    return '[]';
  }
}