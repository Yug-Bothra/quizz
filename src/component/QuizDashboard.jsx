import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { Trophy, BookOpen, User, LogOut, History, Award, TrendingUp, Calendar, ChevronDown, ChevronUp } from "lucide-react";

const QuizDashboard = () => {
  const [student, setStudent] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const enrollment = query.get("enrollment");
    if (!enrollment) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch student info
        const { data: studentData, error: studentErr } = await supabase
          .from("students")
          .select("*")
          .eq("enrollment_number", enrollment)
          .single();

        if (studentErr) throw studentErr;
        setStudent(studentData);

        // Fetch quiz results from quiz_history
        const { data: quizData, error: quizErr } = await supabase
          .from("quiz_history")
          .select("*")
          .eq("enrollment_number", enrollment)
          .order("attempted_at", { ascending: false });

        if (quizErr) throw quizErr;
        setQuizResults(quizData || []);
      } catch (err) {
        console.error("Error loading quiz dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAverageScore = () => {
    if (quizResults.length === 0) return 0;
    const totalPercentage = quizResults.reduce((sum, quiz) => sum + (quiz.score / quiz.total_questions) * 100, 0);
    return (totalPercentage / quizResults.length).toFixed(1);
  };

  const getBestScore = () => {
    if (quizResults.length === 0) return 0;
    return Math.max(...quizResults.map(quiz => (quiz.score / quiz.total_questions) * 100)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="text-lg text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-700">No student found. Please login via CMS first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">{student.name}</h2>
                <p className="text-sm text-gray-500">ID: {student.enrollment_number}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Award className="h-4 w-4" />
                  <span>Quizzes: {quizResults.length}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Avg: {getAverageScore()}%</span>
                </div>
              </div>
              
              <button className="flex items-center text-gray-600 hover:text-red-500 transition-colors duration-200 bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-lg">
                <LogOut className="h-5 w-5 mr-2" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {student.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Ready to test your knowledge today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Quizzes</p>
                <p className="text-3xl font-bold text-indigo-600">{quizResults.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-green-600">{getAverageScore()}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Best Score</p>
                <p className="text-3xl font-bold text-yellow-600">{getBestScore()}%</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={`/quiz?enrollment=${student.enrollment_number}`}
            className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6" />
              <span className="text-lg">Start New Quiz</span>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </Link>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm text-gray-700 font-semibold px-8 py-4 rounded-2xl shadow-lg hover:bg-white/90 transition-all duration-300 border border-white/20 hover:shadow-xl"
          >
            <History className="h-6 w-6" />
            <span className="text-lg">Quiz History</span>
            {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Quiz History (Collapsible) */}
        {showHistory && (
          <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden transition-all duration-500">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-2xl font-bold flex items-center text-gray-800">
                <Trophy className="h-6 w-6 mr-3 text-yellow-500" />
                Quiz History
              </h2>
              <p className="text-gray-600 mt-1">Track your progress over time</p>
            </div>

            <div className="p-6">
              {quizResults.length > 0 ? (
                <div className="space-y-4">
                  {quizResults.map((q, i) => (
                    <div
                      key={i}
                      className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-indigo-300"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <BookOpen className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-lg">
                              {q.subject_id || "General Quiz"}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(q.attempted_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{new Date(q.attempted_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="text-2xl font-bold text-indigo-600">
                                {q.score} / {q.total_questions}
                              </p>
                              <p className="text-sm text-gray-600">
                                {((q.score / q.total_questions) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                              (q.score / q.total_questions) * 100 >= 80 
                                ? 'bg-green-100 text-green-600' 
                                : (q.score / q.total_questions) * 100 >= 60
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {((q.score / q.total_questions) * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No quizzes attempted yet.</p>
                  <p className="text-gray-400 text-sm">Start your first quiz to see your progress here!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDashboard;