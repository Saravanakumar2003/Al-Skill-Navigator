// src/components/SentimentAnalysis.jsx
import React, { useEffect, useState } from 'react';
import { getGeminiResponse2 } from '../utils/gemini2';

// Polyfill for the global variable
if (typeof global === 'undefined') {
  window.global = window;
}

const SentimentAnalysis = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        const apiKey = 'AIzaSyCo_VL605kqdwtv_4kPqG_HTG6ej785NeY';
        const spreadsheetId = '1QxZRMBdzMwGUKOa-BdVjUX9c1W1i85iC32-XJv8kptk';
      const range = 'Form Responses 1!A2:G50';

      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        const rows = data.values;

        if (rows && rows.length) {
          const jsonData = rows.map(row => ({
            userName: row[1],
            ratingOfExperience: row[4],
            feedback: row[5],
            suggestionForImprovement: row[6],
          }));

          const promptText = `
            Gemini, you are a Sentiment Analysis Expert.
            You are given feedback form data in JSON format.
            Your task is to give a sentiment analysis value for each entry.

            The sentiment analysis score should range from 1 to 100 inclusive.
            The sentiment text should be any of the four values: Bad, Moderate, Good, Perfect.
            The condition for sentiment text are,
              1 <= sentimentAnalysisScore < 30 => Bad,
              30 <= sentimentAnalysisScore < 60 => Moderate,
              60 <= sentimentAnalysisScore < 90 => Good,
              90 <= sentimentAnalysisScore <= 100 => Perfect,
            The professional ai feedback should be inferred from 'feedback' key to generate professional and technical feedback understandable by technical team

            Only predict sentimentAnalysisScore, sentimentText, professionalAiFeedback. Keep the other fields the same.

            Output format should be in JSON like this: 
            [
              { userName: '', ratingOfExperience: '', feedback: '', suggestionForImprovement: '', sentimentAnalysisScore: '', sentimentText: '', professionalAiFeedback: '' },
              { userName: '', ratingOfExperience: '', feedback: '', suggestionForImprovement: '', sentimentAnalysisScore: '', sentimentText: '', professionalAiFeedback: '' }
            ]
            Here is the feedback form data JSON: ${JSON.stringify(jsonData)}
          `;

          const geminiResponse = await getGeminiResponse2(promptText);
          const sanitizedReplyText = geminiResponse.replace(/```json|```/g, '').trim();
          setFeedbackData(JSON.parse(sanitizedReplyText));
        } else {
          console.log('No data found.');
        }
      } catch (err) {
        console.error('Error fetching data from Google Sheets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {feedbackData.map((feedback, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">{feedback.userName}</h3>
          <p><strong>Rating:</strong> {feedback.ratingOfExperience}</p>
          <p><strong>Feedback:</strong> {feedback.feedback}</p>
          <p><strong>Suggestion:</strong> {feedback.suggestionForImprovement}</p>
          <p><strong>Sentiment Score:</strong> {feedback.sentimentAnalysisScore}</p>
          <p><strong>Sentiment Text:</strong> {feedback.sentimentText}</p>
          <p><strong>AI Feedback:</strong> {feedback.professionalAiFeedback}</p>
        </div>
      ))}
    </div>
  );
};

export default SentimentAnalysis;