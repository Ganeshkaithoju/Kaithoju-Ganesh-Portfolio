/**
 * Security Questions for Password Reset
 * 
 * Answers are stored in environment variables for security
 * SECURITY_ANSWER_1: Dream car answer
 * SECURITY_ANSWER_2: First mobile name answer
 */

export const SECURITY_QUESTIONS = [
  {
    id: 1,
    question: "What is your dream car?",
    envKey: "SECURITY_ANSWER_1",
  },
  {
    id: 2,
    question: "What is your first mobile name?",
    envKey: "SECURITY_ANSWER_2",
  },
];

/**
 * Normalize answer for comparison (lowercase, trim)
 */
function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

/**
 * Verify security answers
 */
export function verifySecurityAnswers(
  answer1: string,
  answer2: string
): boolean {
  const expectedAnswer1 = normalizeAnswer(process.env.SECURITY_ANSWER_1 || "");
  const expectedAnswer2 = normalizeAnswer(process.env.SECURITY_ANSWER_2 || "");

  if (!expectedAnswer1 || !expectedAnswer2) {
    console.error("Security answers not configured in environment variables");
    return false;
  }

  const providedAnswer1 = normalizeAnswer(answer1);
  const providedAnswer2 = normalizeAnswer(answer2);

  return (
    providedAnswer1 === expectedAnswer1 && providedAnswer2 === expectedAnswer2
  );
}

/**
 * Get security questions
 */
export function getSecurityQuestions() {
  return SECURITY_QUESTIONS;
}
