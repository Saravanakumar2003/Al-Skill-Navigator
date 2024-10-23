import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { getGeminiResponse } from '../../utils/gemini'; // Correct import path

const AddQuiz = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState('');
  const [timer, setTimer] = useState(0);

  // New state variables for user inputs
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [alreadyAskedQuestions, setAlreadyAskedQuestions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const courseCollection = collection(db, 'courses');
      const courseSnapshot = await getDocs(courseCollection);
      const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(courseList);
    };

    fetchCourses();
  }, []);

  const handleAddQuestion = () => {
    if (!newQuestion || options.includes('') || !correctOption) {
      alert('Please fill in all fields correctly.');
      return;
    }

    const question = {
      question: newQuestion,
      type: 'multiple-choice',
      options: options,
      correctAnswer: correctOption,
    };

    setQuestions([...questions, question]);
    setNewQuestion('');
    setOptions(['', '', '', '']);
    setCorrectOption('');
  };

  const handleGenerateQuestion = async () => {
    const questionType = "MCQ with 4 Options and only one correct option";
    const format = "{questionText: 'The question', questionOptions: ['', '', '', ''], correctOptionIndex: '', explanation: ''}";

    const prompt = `
      Gemini, you are a assistant to an 'Question Writer'.
      Your job is to generate one question on topic ${topic} and sub topic is ${subTopic}.
      The question type is - ${questionType}.
      Your reply format should be in JSON format like this.
      The format : ${format}.
      The already asked questions are : ${alreadyAskedQuestions}.
      Avoid asking questions similar to already asked questions.
    `;

    const replyText = await getGeminiResponse(prompt);

    console.log(replyText); // Log the generated question

    if (replyText) {
      try {
        // Sanitize the response to remove unwanted characters
        const sanitizedReplyText = replyText.replace(/```json|```/g, '').trim();
        const generatedQuestion = JSON.parse(sanitizedReplyText);
        console.log(generatedQuestion); // Log the parsed question
        const question = {
          question: generatedQuestion.questionText,
          type: 'multiple-choice',
          options: generatedQuestion.questionOptions,
          correctAnswer: generatedQuestion.questionOptions[generatedQuestion.correctOptionIndex],
        };
        console.log(question); // Log the question object
        setQuestions([...questions, question]);
        setAlreadyAskedQuestions([...alreadyAskedQuestions, generatedQuestion.questionText]);
      } catch (error) {
        console.error('Error parsing generated question:', error);
        alert('Failed to parse generated question. Please try again.');
      }
    } else {
      alert('Failed to generate question. Please try again.');
    }
  };

  const handleSaveQuiz = async () => {
    if (!selectedCourseId || questions.length === 0) {
      alert('Please select a course and add at least one question.');
      return;
    }

    try {
      const courseRef = doc(db, 'courses', selectedCourseId);

      await updateDoc(courseRef, {
        quiz: questions,
        timer: timer
      });

      alert('Quiz added successfully!');
      navigate('/admin'); // Redirect after successful save
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Error saving quiz. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl text-center font-bold mb-6">Add Quiz</h1>

      <hr className="my-6 border-black" />

      <h2 className="block text-2xl font-medium mb-2">Add Quiz Details</h2>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Select Course:</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Quiz Timer (in minutes):</label>
        <input
          type="number"
          value={timer}
          onChange={(e) => setTimer(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <hr className="my-6 border-black" /> 
         
      <h2 className="block text-2xl font-medium mb-2">Add Question using AI</h2>
      <div className="mb-6">
        <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Topic:</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Sub Topic:</label>
        <input
          type="text"
          value={subTopic}
          onChange={(e) => setSubTopic(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

        <button
          onClick={handleGenerateQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate
        </button>
      </div>

      <hr className="my-6 border-black" /> 

      <h2 className="block text-2xl font-medium mb-2">Add Question Mannually</h2>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Question</h2>
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter question"
          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm mb-4 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
              placeholder={`Option ${index + 1}`}
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-lg font-medium mb-2">Correct Option:</label>
          <select
            value={correctOption}
            onChange={(e) => setCorrectOption(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Select correct option</option>
            {options.map((option, index) => (
              <option key={index} value={option}>Option {index + 1}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAddQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Question
        </button>
      </div>

      <hr className="my-6 border-black" />


      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Questions</h2>
        <ul className="list-disc pl-5">
          {questions.map((q, index) => (
            <li key={index} className="mb-4">
              <strong>{q.question}</strong>
              {q.type === 'multiple-choice' && (
                <ul className="list-disc pl-5">
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt} {opt === q.correctAnswer && <span className="text-green-500">(Correct)</span>}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleSaveQuiz}
        className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Save Quiz
      </button>
    </div>
  );
};

export default AddQuiz;