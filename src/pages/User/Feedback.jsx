import React from 'react';

const Feedback = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Feedback</h1>
            
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Course Feedback</h2>
                <iframe
                    src="https://forms.gle/mnN4LcsfoQMkr2Vs7"
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    title="Course Feedback Form"
                >
                    Loading…
                </iframe>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-2">Instructor Feedback</h2>
                <iframe
                    src="https://forms.gle/R6AdXWxL4AasbLZe8"
                    width="100%"
                    height="600px"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    title="Instructor Feedback Form"
                >
                    Loading…
                </iframe>
            </div>
        </div>
    );
};

export default Feedback;