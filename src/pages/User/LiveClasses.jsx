import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const LiveClasses = () => {
    const [liveClasses, setLiveClasses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                console.log('User ID set:', user.uid);
            } else {
                console.error('No user is signed in');
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            if (userId) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setEnrolledCourses(userData.enrolledCourses || []);
                } else {
                    console.error('No such user document!');
                }
            }
        };

        fetchEnrolledCourses();
    }, [userId]);

    useEffect(() => {
        const fetchLiveClasses = async () => {
            if (enrolledCourses.length > 0) {
                const q = query(collection(db, 'liveClasses'), where('courseId', 'in', enrolledCourses));
                const querySnapshot = await getDocs(q);
                const classes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLiveClasses(classes);
            }
        };

        fetchLiveClasses();
    }, [enrolledCourses]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Live Classes</h1>
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
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No live classes scheduled.</p>
            )}
        </div>
    );
};

export default LiveClasses;