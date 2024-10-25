import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebaseConfig';
import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CreateLiveClass = () => {
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    instructor: '',
    meetingLink: ''
  });
  const [courses, setCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const coursesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesList);
    };

    fetchCourses();
    fetchLiveClasses();
  }, []);

  const fetchLiveClasses = async () => {
    const querySnapshot = await getDocs(collection(db, 'liveClasses'));
    const liveClassesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLiveClasses(liveClassesList);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'liveClasses', editId), formData);
        setIsEditing(false);
        setEditId(null);
      } else {
        await addDoc(collection(db, 'liveClasses'), formData);
      }
      setFormData({
        courseId: '',
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        instructor: '',
        meetingLink: ''
      });
      alert('Live class saved successfully!');
      fetchLiveClasses(); // Refresh the live classes list
    } catch (error) {
      console.error('Error saving live class:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'liveClasses', id));
      setLiveClasses(liveClasses.filter(liveClass => liveClass.id !== id));
    } catch (error) {
      console.error('Error deleting live class:', error);
    }
  };

  const handleEdit = (liveClass) => {
    setFormData(liveClass);
    setIsEditing(true);
    setEditId(liveClass.id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Live Class' : 'Create Live Class'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Course</label>
          <select
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Instructor</label>
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Meeting Link</label>
          <input
            type="text"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
          {isEditing ? 'Update Live Class' : 'Create Live Class'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mt-8 mb-4">Manage Live Classes</h2>
      {liveClasses.length > 0 ? (
        <ul>
          {liveClasses.map(liveClass => (
            <li key={liveClass.id} className="mb-4 p-4 bg-white shadow-lg rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{liveClass.title}</h2>
              <p className="mb-2">{liveClass.description}</p>
              <p className="mb-2"><strong>Instructor:</strong> {liveClass.instructor}</p>
              <p className="mb-2"><strong>Start Time:</strong> {new Date(liveClass.startTime).toLocaleString()}</p>
              <p className="mb-2"><strong>End Time:</strong> {new Date(liveClass.endTime).toLocaleString()}</p>
              <a href={liveClass.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
                Join Live Class
              </a>
              <button
                onClick={() => handleEdit(liveClass)}
                className="ml-4 inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(liveClass.id)}
                className="ml-4 inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No live classes scheduled.</p>
      )}
    </div>
  );
};

export default CreateLiveClass;