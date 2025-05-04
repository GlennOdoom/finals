import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthenticationContext";
import {
  Lesson,
  updateLessonProgress,
  submitQuizAnswer,
  Quiz,
  getLessonById,
} from "../../Services/lessonService";
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface LessonViewProps {
  lessonId: string;
  courseId: string;
  onComplete?: () => void;
  onBackToCourse: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({
  lessonId,
  courseId,
  onComplete,
  onBackToCourse,
  onNext,
  onPrevious,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [quizId: string]: string }>(
    {}
  );
  const [quizResults, setQuizResults] = useState<{ [quizId: string]: boolean }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [hasCompletedLesson, setHasCompletedLesson] = useState<boolean>(false);
  const { currentUser } = useAuth();

  // Fetch lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const lessonData = await getLessonById(lessonId);

        if (lessonData) {
          setLesson(lessonData);

          // Check if the user has already completed this lesson
          if (
            currentUser &&
            lessonData.completedBy &&
            lessonData.completedBy.includes(currentUser.uid)
          ) {
            setHasCompletedLesson(true);
          }

          // Reset quiz state when loading a new lesson
          setQuizAnswers({});
          setQuizResults({});
          setCurrentStep(0);
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, currentUser]);

  const handleNextStep = () => {
    if (lesson && currentStep < lesson.content.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizAnswer = (quizId: string, answer: string) => {
    setQuizAnswers({
      ...quizAnswers,
      [quizId]: answer,
    });
  };

  const handleSubmitQuiz = async (quiz: Quiz) => {
    if (!currentUser || !quizAnswers[quiz.id]) return;

    setLoading(true);

    try {
      const isCorrect = await submitQuizAnswer(
        quiz.id,
        quizAnswers[quiz.id],
        currentUser.uid
      );

      setQuizResults({
        ...quizResults,
        [quiz.id]: isCorrect,
      });

      // If answer is correct, check if this is the last step to mark as completed
      if (isCorrect && lesson && currentStep === lesson.content.length - 1) {
        await handleCompleteLesson();
      }
    } catch (error) {
      console.error("Error submitting quiz answer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentUser || !lesson) return;

    setLoading(true);

    try {
      if (quiz && quiz.id) {
        await submitQuizAnswer(quiz.id, quizAnswers[quiz.id], currentUser.uid);
      }
      setHasCompletedLesson(true);
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !lesson) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p>Lesson not found.</p>
        <button
          onClick={onBackToCourse}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Back to Course
        </button>
      </div>
    );
  }

  const currentContent = lesson.content[currentStep];
  const isQuiz =
    currentContent &&
    typeof currentContent !== "string" &&
    currentContent.type === "quiz";
  const quiz =
    isQuiz && currentContent && typeof currentContent !== "string"
      ? currentContent.quiz
      : null;

  const isLastStep = currentStep === lesson.content.length - 1;
  const showNextButton =
    !isQuiz || (quiz && quizResults[quiz.id] !== undefined);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={onBackToCourse}
        className="flex items-center text-blue-500 mb-6 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back to Course
      </button>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        {hasCompletedLesson && (
          <div className="flex items-center text-green-500">
            <Check size={16} className="mr-1" />
            Completed
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Lesson Progress</span>
          <span className="text-sm font-medium">
            {Math.round(((currentStep + 1) / lesson.content.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / lesson.content.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-8">
        {isQuiz && quiz ? (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">{quiz.question}</h2>

            <div className="space-y-2">
              {quiz.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    quizAnswers[quiz.id] === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                  onClick={() => handleQuizAnswer(quiz.id, option)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        quizAnswers[quiz.id] === option
                          ? "border-blue-500"
                          : "border-gray-400"
                      }`}
                    >
                      {quizAnswers[quiz.id] === option && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>

            {quizResults[quiz.id] !== undefined && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  quizResults[quiz.id]
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  {quizResults[quiz.id] ? (
                    <Check size={20} className="mr-2 text-green-600" />
                  ) : (
                    <X size={20} className="mr-2 text-red-600" />
                  )}
                  <span>
                    {quizResults[quiz.id]
                      ? "Correct! Good job."
                      : `Incorrect. The correct answer is "${quiz.correctAnswer}".`}
                  </span>
                </div>
              </div>
            )}

            {quizAnswers[quiz.id] && quizResults[quiz.id] === undefined && (
              <button
                onClick={() => handleSubmitQuiz(quiz)}
                disabled={loading}
                className={`mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Checking..." : "Submit Answer"}
              </button>
            )}
          </div>
        ) : (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
          </div>
        )}
      </div>

      {/* Navigation buttons - internal steps */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
            currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>

        <div>
          {showNextButton &&
            (isLastStep ? (
              <button
                onClick={handleCompleteLesson}
                disabled={loading || hasCompletedLesson}
                className={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                  loading || hasCompletedLesson
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {loading
                  ? "Loading..."
                  : hasCompletedLesson
                  ? "Completed"
                  : "Complete Lesson"}
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Next
                <ArrowRight size={16} className="ml-1 inline" />
              </button>
            ))}
        </div>
      </div>

      {/* Navigation buttons - between lessons */}
      <div className="flex justify-between mt-8 border-t pt-4">
        <button
          onClick={onPrevious}
          className={`flex items-center text-blue-500 hover:text-blue-700 ${
            !onPrevious ? "invisible" : ""
          }`}
        >
          <ChevronLeft size={16} className="mr-1" />
          Previous Lesson
        </button>

        <button
          onClick={onNext}
          className={`flex items-center text-blue-500 hover:text-blue-700 ${
            !onNext ? "invisible" : ""
          }`}
        >
          Next Lesson
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default LessonView;
