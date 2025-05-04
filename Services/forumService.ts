import { db } from "../Contexts/new_firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  updateDoc,
  serverTimestamp,
  Timestamp,
  limit,
  DocumentData
} from "firebase/firestore";

export interface ForumPost {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  courseId?: string;
  lessonId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  replyCount: number;
}

export interface PostReply {
  id?: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
}

// Get all forum posts
export const getAllForumPosts = async () => {
  const q = query(
    collection(db, "forumPosts"),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
};

// Get forum posts for a specific course
export const getCourseForumPosts = async (courseId: string) => {
  const q = query(
    collection(db, "forumPosts"),
    where("courseId", "==", courseId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
};

// Get forum posts for a specific lesson
export const getLessonForumPosts = async (lessonId: string) => {
  const q = query(
    collection(db, "forumPosts"),
    where("lessonId", "==", lessonId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
};

// Create a new forum post
export const createForumPost = async (postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'replyCount'>) => {
  const post = {
    ...postData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    replyCount: 0
  };
  
  const docRef = await addDoc(collection(db, "forumPosts"), post);
  return { id: docRef.id, ...post };
};

// Get a specific forum post by ID
export const getForumPost = async (postId: string) => {
  const postRef = doc(db, "forumPosts", postId);
  const postSnap = await getDoc(postRef);
  return postSnap.exists() ? { id: postSnap.id, ...postSnap.data() } as ForumPost : null;
};

// Get replies for a specific post
export const getPostReplies = async (postId: string) => {
  const q = query(
    collection(db, "postReplies"),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostReply));
};

// Create a reply to a post
export const createPostReply = async (replyData: Omit<PostReply, 'id' | 'createdAt'>) => {
  const reply = {
    ...replyData,
    createdAt: serverTimestamp()
  };
  
  // Add the reply
  const replyRef = await addDoc(collection(db, "postReplies"), reply);
  
  // Update the reply count on the original post
  const postRef = doc(db, "forumPosts", replyData.postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const postData = postSnap.data() as ForumPost;
    await updateDoc(postRef, {
      replyCount: (postData.replyCount || 0) + 1,
      updatedAt: serverTimestamp()
    });
  }
  
  return { id: replyRef.id, ...reply };
};

// Get posts from enrolled courses
export const getEnrolledCoursesForumPosts = async (userId: string, courseIds: string[]) => {
  if (!courseIds.length) return [];
  
  const q = query(
    collection(db, "forumPosts"),
    where("courseId", "in", courseIds),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
};

// Get most active discussions (with most replies)
export const getMostActiveDiscussions = async (count: number = 10) => {
  const q = query(
    collection(db, "forumPosts"),
    orderBy("replyCount", "desc"),
    limit(count)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
};

// Get posts created by a specific user
export const getUserPosts = async (userId: string) => {
  const q = query(
    collection(db, "forumPosts"),
    where("authorId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
};

// Get replies created by a specific user
export const getUserReplies = async (userId: string) => {
  const q = query(
    collection(db, "postReplies"),
    where("authorId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  const replies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostReply));
  
  // Optional: fetch the associated posts if needed
  const postIds = [...new Set(replies.map(reply => reply.postId))];
  const posts: Record<string, ForumPost> = {};
  
  for (const postId of postIds) {
    const post = await getForumPost(postId);
    if (post) {
      posts[postId] = post;
    }
  }
  
  return { replies, posts };
};

// Check if user can reply (admin or teacher)
export const canUserReply = async (userId: string) => {
  if (!userId) return false;
  
  // Get user document to check role
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    return userData.role === 'admin' || userData.role === 'teacher';
  }
  
  return false;
};