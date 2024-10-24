// src/pages/Admin/Feedback.jsx
import React from 'react';
import SentimentAnalysis from '../../components/SentimentAnalysis';

const AdminFeedback = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Feedback</h1>
      <SentimentAnalysis />
    </div>
  );
};

export default AdminFeedback;