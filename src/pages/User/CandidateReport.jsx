import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../config/firebaseConfig'; // Adjust the path to your firebase config

const CandidateReport = () => {
    const [candidateData, setCandidateData] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            setUserId(user.uid);
            console.log('User ID set:', user.uid);
        } else {
            console.error('No user is signed in');
        }
    }, []);

    useEffect(() => {
        if (userId) {
            // Fetch candidate data from Firestore
            const fetchCandidateData = async () => {
                try {
                    const candidateDoc = doc(db, 'users', userId);
                    const candidateSnapshot = await getDoc(candidateDoc);
                    if (candidateSnapshot.exists()) {
                        setCandidateData(candidateSnapshot.data());
                    } else {
                        console.error('No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching candidate data:', error);
                }
            };

            fetchCandidateData();
        }
    }, [userId]);

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Individual Candidate Report', 20, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Field', 'Details']],
            body: [
                ['Name', candidateData.name],
                ['Email ID', candidateData.email],
                ['Degree', candidateData.degrees],
                ['Specialization', candidateData.specialization],
                ['Certifications', candidateData.certifications],
                ['Internship Details', candidateData.internshipDetails],
                ['Course Completion', candidateData.coursesCompleted],
                ['MCQ Scores', candidateData.mcqScores ? candidateData.mcqScores.join(', ') : 'N/A'],
                ['Project Evaluation', candidateData.projectScores ? candidateData.projectScores.join(', ') : 'N/A'],
                ['AI Recommendations', candidateData.aiRecommendations ? candidateData.aiRecommendations : 'N/A'],
                ['Feedback', candidateData.feedback ? candidateData.feedback : 'N/A'],
            ],
        });
        doc.save('Candidate_Report.pdf');
    };

    const generateExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet([
            { Field: 'Name', Details: candidateData.name },
            { Field: 'Email ID', Details: candidateData.email },
            { Field: 'Degree', Details: candidateData.degrees },
            { Field: 'Specialization', Details: candidateData.specialization },
            { Field: 'Certifications', Details: candidateData.certifications },
            { Field: 'Internship Details', Details: candidateData.internshipDetails },
            { Field: 'Course Completion', Details: candidateData.coursesCompleted },
            { Field: 'MCQ Scores', Details: candidateData.mcqScores ? candidateData.mcqScores.join(', ') : 'N/A' },
            { Field: 'Project Evaluation', Details: candidateData.projectScores ? candidateData.projectScores.join(', ') : 'N/A' },
            { Field: 'AI Recommendations', Details: candidateData.aiRecommendations ? candidateData.aiRecommendations : 'N/A' },
            { Field: 'Feedback', Details: candidateData.feedback ? candidateData.feedback : 'N/A' },
        ]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidate Report');
        XLSX.writeFile(workbook, 'Candidate_Report.xlsx');
    };

    if (!candidateData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 mt-14 mx-auto">Individual Candidate Report</h1>
            <button onClick={generatePDF} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mr-2">
                Download PDF
            </button>
            <button onClick={generateExcel} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                Download Excel
            </button>
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Report Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Name</h3>
                        <p>{candidateData.name}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Email ID</h3>
                        <p>{candidateData.email}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Degree</h3>
                        <p>{candidateData.degrees}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Specialization</h3>
                        <p>{candidateData.specialization}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                        <p>{candidateData.certifications}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Internship Details</h3>
                        <p>{candidateData.internshipDetails}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Course Completion</h3>
                        <p>{candidateData.coursesCompleted}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">MCQ Scores</h3>
                        <p>{candidateData.mcqScores ? candidateData.mcqScores.join(', ') : 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Project Evaluation</h3>
                        <p>{candidateData.projectScores ? candidateData.projectScores.join(', ') : 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">AI Recommendations</h3>
                        <p>{candidateData.aiRecommendations ? candidateData.aiRecommendations : 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                        <p>{candidateData.feedback ? candidateData.feedback : 'N/A'}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CandidateReport;