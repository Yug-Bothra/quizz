// src/services/quizService.js
import { supabase } from "../supabaseClient";

/**
 * Save quiz attempt to Supabase `quiz_history` table
 * @param {Object} payload - Quiz result data
 * @param {string} payload.enrollment_number - Student enrollment number
 * @param {string} [payload.subject_id] - Optional subject identifier
 * @param {number} payload.score - Score obtained
 * @param {number} payload.total_questions - Total number of questions
 * @param {number} payload.correct_answers - Number of correct answers
 * @param {Array|Object} [payload.quiz_data] - Full questions and user's answers
 */
export const saveQuizResult = async ({
  enrollment_number,
  subject_id = null,
  score,
  total_questions,
  correct_answers,
  quiz_data = null
}) => {
  try {
    const { data, error } = await supabase
      .from("quiz_history")
      .insert([
        {
          enrollment_number,
          subject_id,
          score,
          total_questions,
          correct_answers,
          quiz_data: quiz_data ? JSON.stringify(quiz_data) : null
        }
      ]);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error saving quiz result:", err.message);
    return null;
  }
};
