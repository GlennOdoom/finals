import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthenticationContext";
import {
  getCourses,
  Course,
  deleteCourse,
  createCourse,
  updateCourse,
} from "../../Services/lessonService";
import LessonManagement from "../Lessons/lessonManagement";
import { PlusCircle, Edit, Trash, List, ArrowLeft } from "lucide-react";

interface CourseManagementProps {
  onBack: () => void;
}

const CourseManagement: React.FC<CourseManagementProps> = ({ onBack }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    estimatedTime: "",
  });
  const { currentUser } = useAuth();

  // Added state for lesson management view
  const [selectedCourseForLessons, setSelectedCourseForLessons] =
    useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const coursesData = await getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormOpen = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl || "",
        estimatedTime: course.estimatedTime || "",
      });
    } else {
      setEditingCourse(null);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        estimatedTime: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("You must be logged in to manage courses");
      return;
    }

    try {
      if (editingCourse && editingCourse.id) {
        // Update existing course using the service function
        await updateCourse(editingCourse.id, {
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          estimatedTime: formData.estimatedTime,
        });
        alert("Course updated successfully!");
      } else {
        // Create new course using the service function
        await createCourse({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          estimatedTime: formData.estimatedTime,
          createdBy: currentUser.uid,
        });
        alert("Course created successfully!");
      }

      setIsFormOpen(false);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course. Please try again.");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course? This will also delete all associated lessons."
      )
    ) {
      return;
    }

    try {
      // Use the service function to delete the course and its lessons
      await deleteCourse(courseId);
      alert("Course and all its lessons have been deleted");
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course. Please try again.");
    }
  };

  const handleManageLessons = (course: Course) => {
    setSelectedCourseForLessons(course);
  };

  const handleBackFromLessons = () => {
    setSelectedCourseForLessons(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show lesson management view if a course is selected for lesson management
  if (selectedCourseForLessons) {
    return (
      <LessonManagement
        courseId={selectedCourseForLessons.id || ""}
        courseName={selectedCourseForLessons.title}
        onBack={handleBackFromLessons}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Updated header section with back button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold">Course Management</h1>
        </div>
        <button
          onClick={() => handleFormOpen()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusCircle size={16} className="mr-2" />
          Add New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No courses available. Create your first course!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              {course.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex justify-between mt-4">
                  <div className="space-x-2">
                    <button
                      onClick={() => handleFormOpen(course)}
                      className="flex items-center text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleManageLessons(course)}
                      className="flex items-center text-green-500 hover:text-green-700"
                    >
                      <List size={16} className="mr-1" />
                      Lessons
                    </button>
                  </div>
                  <button
                    onClick={() => course.id && handleDeleteCourse(course.id)}
                    className="flex items-center text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form for adding/editing courses */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingCourse ? "Edit Course" : "Add New Course"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
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

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="text"
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  {editingCourse ? "Update Course" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
