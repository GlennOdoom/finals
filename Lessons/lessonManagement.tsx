import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthenticationContext";
import {
  getCourseLessons,
  Lesson,
  LessonContent,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../Services/lessonService";
import { PlusCircle, Edit, Trash, ArrowLeft, Plus, X } from "lucide-react";

interface LessonManagementProps {
  courseId: string;
  courseName: string;
  onBack: () => void;
}

const LessonManagement: React.FC<LessonManagementProps> = ({
  courseId,
  courseName,
  onBack,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: [] as LessonContent[],
    order: 0,
    durationMinutes: 30,
    videoUrl: "",
  });
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const lessonsData = await getCourseLessons(courseId);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormOpen = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson);
      setFormData({
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        order: lesson.order,
        durationMinutes: lesson.durationMinutes,
        videoUrl: lesson.videoUrl || "",
      });
    } else {
      // For a new lesson, set the order to be the next in sequence
      const nextOrder =
        lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) + 1 : 1;

      setEditingLesson(null);
      setFormData({
        title: "",
        description: "",
        content: [],
        order: nextOrder,
        durationMinutes: 30,
        videoUrl: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "order" || name === "durationMinutes"
          ? parseInt(value, 10)
          : value,
    }));
  };

  // Function to handle content items
  const handleAddContentItem = () => {
    setFormData((prev) => ({
      ...prev,
      content: [
        ...prev.content,
        { type: "text", content: "" } as LessonContent,
      ],
    }));
  };

  // Function to update content items
  const handleContentItemChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const newContent = [...prev.content];
      if (field === "type") {
        // If changing type, reset the content and quiz fields
        newContent[index] = {
          type: value as "text" | "video" | "quiz",
          content: "",
          quiz:
            value === "quiz"
              ? { id: "", question: "", options: [""], correctAnswer: "" }
              : undefined,
        };
      } else if (field === "content") {
        newContent[index] = { ...newContent[index], content: value };
      } else if (field === "quiz") {
        // This handles the quiz properties but is simplified here
        const currentQuiz = newContent[index].quiz || {
          id: "",
          question: "",
          options: [""],
          correctAnswer: "",
        };
        newContent[index] = {
          ...newContent[index],
          quiz: { ...currentQuiz, question: value },
        };
      }
      return { ...prev, content: newContent };
    });
  };

  // Function to remove content items
  const handleRemoveContentItem = (index: number) => {
    setFormData((prev) => {
      const newContent = [...prev.content];
      newContent.splice(index, 1);
      return { ...prev, content: newContent };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to manage lessons");
      return;
    }

    try {
      if (editingLesson && editingLesson.id) {
        // Update existing lesson using service function
        await updateLesson(editingLesson.id, {
          title: formData.title,
          description: formData.description,
          content: formData.content,
          order: formData.order,
          durationMinutes: formData.durationMinutes,
          videoUrl: formData.videoUrl,
        });
        alert("Lesson updated successfully!");
      } else {
        // Create new lesson using service function
        await createLesson({
          courseId: courseId,
          title: formData.title,
          description: formData.description,
          content: formData.content,
          order: formData.order,
          durationMinutes: formData.durationMinutes,
          videoUrl: formData.videoUrl,
          completedBy: [],
        });
        alert("Lesson created successfully!");
      }

      setIsFormOpen(false);
      fetchLessons(); // Refresh the list
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Failed to save lesson. Please try again.");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this lesson? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Use service function to delete the lesson
      await deleteLesson(lessonId);
      alert("Lesson has been deleted");
      fetchLessons(); // Refresh the list
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Courses
          </button>
          <h1 className="text-2xl font-bold">Lessons for: {courseName}</h1>
        </div>
        <button
          onClick={() => handleFormOpen()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusCircle size={16} className="mr-2" />
          Add New Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No lessons available. Create your first lesson!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson) => (
              <div
                key={lesson.id}
                className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      {lesson.order}
                    </span>
                    <h3 className="font-medium text-lg">{lesson.title}</h3>
                  </div>
                  <p className="text-gray-600 mt-1 ml-11">
                    {lesson.description}
                  </p>
                  <div className="text-sm text-gray-500 mt-2 ml-11">
                    Duration: {lesson.durationMinutes} minutes
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleFormOpen(lesson)}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => lesson.id && handleDeleteLesson(lesson.id)}
                    className="flex items-center text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal form for adding/editing lessons */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  required
                />
              </div>

              {/* Content Section */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 text-sm font-bold">
                    Lesson Content
                  </label>
                  <button
                    type="button"
                    onClick={handleAddContentItem}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Content Block
                  </button>
                </div>

                {formData.content.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No content blocks added yet. Add your first content block!
                    </p>
                  </div>
                )}

                {formData.content.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 mb-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                          {index + 1}
                        </span>
                        <select
                          value={item.type}
                          onChange={(e) =>
                            handleContentItemChange(
                              index,
                              "type",
                              e.target.value
                            )
                          }
                          className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">Text</option>
                          <option value="video">Video</option>
                          <option value="quiz">Quiz</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContentItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {item.type === "text" && (
                      <textarea
                        value={item.content}
                        onChange={(e) =>
                          handleContentItemChange(
                            index,
                            "content",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Enter text content here..."
                      />
                    )}

                    {item.type === "video" && (
                      <input
                        type="text"
                        value={item.content}
                        onChange={(e) =>
                          handleContentItemChange(
                            index,
                            "content",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter video URL here..."
                      />
                    )}

                    {item.type === "quiz" && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-700 text-sm mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={item.quiz?.question || ""}
                            onChange={(e) =>
                              handleContentItemChange(
                                index,
                                "quiz",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter quiz question here..."
                          />
                        </div>

                        {/* In a real app, you would add more fields for quiz options and correct answer */}
                        <div className="bg-yellow-100 p-3 rounded-lg">
                          <p className="text-sm">
                            Note: This is a simplified interface. In a complete
                            implementation, you would have fields for quiz
                            options and the correct answer.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Video URL (optional)
                  </label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingLesson ? "Update Lesson" : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonManagement;
