// lessonService.ts implementation
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove,
  DocumentData
} from 'firebase/firestore';
import { db } from '../Contexts/new_firebase';

// Types
export interface Course {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  estimatedTime?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CourseWithLessons extends Course {
  lessons?: Lesson[];
  progress?: number;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface LessonContent {
  type: 'text' | 'video' | 'quiz';
  content: string;
  quiz?: Quiz;
}

export interface Lesson {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  content: LessonContent[];
  order: number;
  durationMinutes: number;
  videoUrl?: string;
  completedBy?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Course CRUD operations
export const getCourses = async (): Promise<Course[]> => {
  try {
    const coursesCollection = collection(db, 'courses');
    const querySnapshot = await getDocs(coursesCollection);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Course));
  } catch (error) {
    console.error('Error getting courses:', error);
    throw error;
  }
};

export const getCourse = async (courseId: string): Promise<Course | null> => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (courseSnap.exists()) {
      return { id: courseSnap.id, ...courseSnap.data() } as Course;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
};

export const createCourse = async (courseData: Omit<Course, 'id'>): Promise<string> => {
  try {
    const coursesCollection = collection(db, 'courses');
    const docRef = await addDoc(coursesCollection, {
      ...courseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<void> => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      ...courseData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    // First, delete all associated lessons
    const lessons = await getCourseLessons(courseId);
    
    const deletePromises = lessons.map(lesson => {
      if (lesson.id) {
        return deleteDoc(doc(db, 'lessons', lesson.id));
      }
      return Promise.resolve();
    });
    
    await Promise.all(deletePromises);
    
    // Then delete the course
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Lesson CRUD operations
export const getCourseLessons = async (courseId: string): Promise<Lesson[]> => {
  try {
    const lessonsCollection = collection(db, 'lessons');
    const q = query(lessonsCollection, where('courseId', '==', courseId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Lesson));
  } catch (error) {
    console.error('Error getting lessons:', error);
    throw error;
  }
};

export const getLessonsByCourse = async (courseId: string): Promise<Lesson[]> => {
  return getCourseLessons(courseId);
};

export const getLessonById = async (lessonId: string): Promise<Lesson | null> => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);
    
    if (lessonSnap.exists()) {
      return { id: lessonSnap.id, ...lessonSnap.data() } as Lesson;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting lesson:', error);
    throw error;
  }
};

export const createLesson = async (lessonData: Omit<Lesson, 'id'>): Promise<string> => {
  try {
    const lessonsCollection = collection(db, 'lessons');
    const docRef = await addDoc(lessonsCollection, {
      ...lessonData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

export const updateLesson = async (lessonId: string, lessonData: Partial<Lesson>): Promise<void> => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    await updateDoc(lessonRef, {
      ...lessonData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

export const updateLessonProgress = async (lessonId: string, userId: string, completed: boolean): Promise<void> => {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    
    if (completed) {
      // Add user to completedBy array if they completed the lesson
      await updateDoc(lessonRef, {
        completedBy: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
    } else {
      // Remove user from completedBy array if they uncompleted the lesson
      await updateDoc(lessonRef, {
        completedBy: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

export const submitQuizAnswer = async (quizId: string, answer: string, userId: string): Promise<boolean> => {
  try {
    // In a real app, you would:
    // 1. Fetch the quiz from your database
    // 2. Compare the answer to the correctAnswer
    // 3. Store the result in the database
    // 4. Return whether the answer was correct
    
    // For now, we'll use a simple mock implementation:
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    
    if (quizSnap.exists()) {
      const quiz = quizSnap.data() as { correctAnswer: string };
      return answer === quiz.correctAnswer;
    }
    
    return false;
  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    throw error;
  }
};

export const calculateCourseProgress = (lessons: Lesson[], userId: string): number => {
  if (!lessons || lessons.length === 0) return 0;
  
  const completedLessons = lessons.filter(lesson => 
    lesson.completedBy && lesson.completedBy.includes(userId)
  );
  
  return Math.round((completedLessons.length / lessons.length) * 100);
};