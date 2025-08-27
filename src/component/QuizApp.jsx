import React, { useState, useEffect, useCallback } from 'react';
import { Clock, FileText, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from "../supabaseClient";

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [quizState, setQuizState] = useState('loading'); // loading, ready, active, completed
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Load and parse CSV file
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/questions.csv');
        const csvText = await response.text();
        
        // Parse CSV using Papaparse for better handling
        Papa.parse(csvText, {
          header: false,
          skipEmptyLines: true,
          dynamicTyping: false,
          complete: (results) => {
            const rows = results.data;
            
            const parsedQuestions = rows.map(row => {
              // Handle the case where correct answer might be empty
              // For demo purposes, let's randomly assign a correct answer if it's missing
              let correctAnswer = row[6] && row[6].trim() ? row[6].trim() : ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
              
              return {
                questionNo: row[0],
                question: row[1],
                optionA: row[2],
                optionB: row[3],
                optionC: row[4],
                optionD: row[5],
                correctAnswer: correctAnswer.toUpperCase()
              };
            }).filter(q => q.question && q.question.trim() && q.questionNo);
            
            // Select 20 random questions
            const shuffled = [...parsedQuestions].sort(() => 0.5 - Math.random());
            const selectedQuestions = shuffled.slice(0, 20);
            
            setQuestions(selectedQuestions);
            setQuizState('ready');
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            setQuizState('error');
          }
        });
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuizState('error');
      }
    };
    
    loadQuestions();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (quizState === 'active' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizState('active');
    setTimeLeft(30 * 60);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const calculateScore = useCallback(() => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = question.correctAnswer.trim().toUpperCase();
      if (userAnswer && userAnswer === correctAnswer) {
        correctCount++;
      }
    });
    return correctCount;
  }, [questions, userAnswers]);

const handleSubmitQuiz = useCallback(() => {
  const finalScore = calculateScore();
  setScore(finalScore);
  setQuizState("completed");
  setShowResults(true);

  // Save result to Supabase quiz_history
  const saveResult = async () => {
    try {
      // Get enrollment from URL query
      const query = new URLSearchParams(window.location.search);
      const enrollment = query.get("enrollment");

      if (!enrollment) {
        console.error("Enrollment not found in URL");
        return;
      }

      const { error } = await supabase.from("quiz_history").insert([
        {
          enrollment_number: enrollment,  // ✅ real enrollment
          subject_id: "DEFAULT_SUBJECT",  // you can replace with actual subject_id
          score: finalScore,
          total_questions: questions.length,
          correct_answers: finalScore,    // if finalScore is already number of correct answers
          quiz_data: JSON.stringify({
            questions,
            userAnswers,
          }),
        },
      ]);

      if (error) {
        console.error("Error saving quiz result:", error);
      } else {
        console.log("✅ Quiz result saved successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  saveResult();
}, [calculateScore, questions, userAnswers]);


  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    setQuizState('ready');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTimeLeft(30 * 60);
    setScore(0);
    setShowResults(false);
  };

  if (quizState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-4">Could not load questions.csv file. Please ensure the file exists in the public folder.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Challenge</h1>
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <FileText className="h-5 w-5" />
              <span>20 Random Questions</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <span>30 Minutes Time Limit</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <CheckCircle className="h-5 w-5" />
              <span>1 Mark per Question</span>
            </div>
          </div>
          <button 
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold py-4 px-8 rounded-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = (score / questions.length * 100).toFixed(1);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <Trophy className={`h-20 w-20 mx-auto mb-4 ${score >= 15 ? 'text-yellow-500' : score >= 10 ? 'text-gray-400' : 'text-orange-500'}`} />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h2>
            <div className="text-6xl font-bold text-indigo-600 mb-2">{score}/20</div>
            <div className="text-xl text-gray-600 mb-4">{percentage}% Correct</div>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              score >= 15 ? 'bg-green-100 text-green-800' : 
              score >= 10 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {score >= 15 ? 'Excellent!' : score >= 10 ? 'Good Job!' : 'Keep Practicing!'}
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const correctAnswer = question.correctAnswer.trim().toUpperCase();
              const isCorrect = userAnswer === correctAnswer;
              
              return (
                <div key={index} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-start space-x-3">
                    {isCorrect ? 
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" /> : 
                      <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                    }
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">Q{index + 1}: {question.question}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={`p-2 rounded ${userAnswer === 'A' ? (isCorrect ? 'bg-green-200' : 'bg-red-200') : 'bg-gray-100'}`}>
                          A: {question.optionA}
                        </div>
                        <div className={`p-2 rounded ${userAnswer === 'B' ? (isCorrect ? 'bg-green-200' : 'bg-red-200') : 'bg-gray-100'}`}>
                          B: {question.optionB}
                        </div>
                        <div className={`p-2 rounded ${userAnswer === 'C' ? (isCorrect ? 'bg-green-200' : 'bg-red-200') : 'bg-gray-100'}`}>
                          C: {question.optionC}
                        </div>
                        <div className={`p-2 rounded ${userAnswer === 'D' ? (isCorrect ? 'bg-green-200' : 'bg-red-200') : 'bg-gray-100'}`}>
                          D: {question.optionD}
                        </div>
                      </div>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 mt-2 font-medium">
                          Correct Answer: {correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={resetQuiz}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Take Another Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Quiz Challenge</h1>
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-lg ${
            timeLeft <= 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Clock className="h-5 w-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>
            
            <div className="grid gap-4">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                  className={`text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    userAnswers[currentQuestionIndex] === option
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                      userAnswers[currentQuestionIndex] === option
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}>
                      {option}
                    </div>
                    <span className="flex-1">{currentQuestion[`option${option}`]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-4">
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors shadow-lg"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
          
          {/* Question Status Grid */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Question Status:</h3>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-indigo-600 text-white'
                      : userAnswers[index]
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizApp;