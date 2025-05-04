import React, { useState, useEffect } from "react";
import { useAuth } from "../../Contexts/AuthenticationContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllForumPosts,
  getCourseForumPosts,
  getLessonForumPosts,
  getPostReplies,
  createForumPost,
  createPostReply,
  ForumPost,
  PostReply,
  getEnrolledCoursesForumPosts,
  getMostActiveDiscussions,
  getUserPosts,
  canUserReply,
} from "../../Services/forumService";
import {
  MessageCircle,
  User,
  Clock,
  Send,
  Filter,
  BarChart2,
} from "lucide-react";
//import "../../Styles/Forums.css";

enum ForumFilterType {
  ALL = "all",
  MY_COURSES = "my-courses",
  MY_POSTS = "my-posts",
  MOST_ACTIVE = "most-active",
}

const ForumPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { courseId, lessonId } = useParams<{
    courseId?: string;
    lessonId?: string;
  }>();

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<PostReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newReplyContent, setNewReplyContent] = useState("");
  const [currentFilter, setCurrentFilter] = useState<ForumFilterType>(
    ForumFilterType.ALL
  );
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [canReply, setCanReply] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [courseId, lessonId, currentFilter, currentUser]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (currentUser) {
        const hasReplyPermission = await canUserReply(currentUser.uid);
        setCanReply(hasReplyPermission);
      } else {
        setCanReply(false);
      }
    };

    checkPermissions();
  }, [currentUser]);

  const fetchPosts = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      let fetchedPosts: ForumPost[] = [];

      if (courseId) {
        // Course-specific posts
        fetchedPosts = await getCourseForumPosts(courseId);
      } else if (lessonId) {
        // Lesson-specific posts
        fetchedPosts = await getLessonForumPosts(lessonId);
      } else {
        // Apply filters for general forum browsing
        switch (currentFilter) {
          case ForumFilterType.MY_COURSES:
            if (
              currentUser.enrolledCourses &&
              currentUser.enrolledCourses.length > 0
            ) {
              fetchedPosts = await getEnrolledCoursesForumPosts(
                currentUser.uid,
                currentUser.enrolledCourses
              );
            }
            break;

          case ForumFilterType.MY_POSTS:
            fetchedPosts = await getUserPosts(currentUser.uid);
            break;

          case ForumFilterType.MOST_ACTIVE:
            fetchedPosts = await getMostActiveDiscussions(10);
            break;

          case ForumFilterType.ALL:
          default:
            fetchedPosts = await getAllForumPosts();
            break;
        }
      }

      setPosts(fetchedPosts);
      // Clear selected post when posts change
      setSelectedPost(null);
      setReplies([]);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPost = async (post: ForumPost) => {
    setSelectedPost(post);
    setLoading(true);

    try {
      const postReplies = await getPostReplies(post.id!);
      setReplies(postReplies);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const postData = {
        title: newPostTitle,
        content: newPostContent,
        authorId: currentUser.uid,
        authorName: currentUser.name,
        courseId: courseId,
        lessonId: lessonId,
      };

      const newPost = await createForumPost(postData);

      // Reset form
      setNewPostTitle("");
      setNewPostContent("");
      setShowNewPostForm(false);

      // Add new post to list
      setPosts([newPost as ForumPost, ...posts]);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !selectedPost || !canReply) return;

    try {
      const replyData = {
        postId: selectedPost.id!,
        content: newReplyContent,
        authorId: currentUser.uid,
        authorName: currentUser.name,
      };

      const newReply = await createPostReply(replyData);

      // Reset form
      setNewReplyContent("");

      // Update replies list
      setReplies([...replies, newReply as PostReply]);

      // Update selected post with new reply count
      setSelectedPost({
        ...selectedPost,
        replyCount: (selectedPost.replyCount || 0) + 1,
      });

      // Update post in posts list
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === selectedPost.id
            ? { ...post, replyCount: (post.replyCount || 0) + 1 }
            : post
        )
      );
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Just now";

    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }

    return "Just now";
  };

  const getPageTitle = () => {
    if (courseId) return "Course Discussion";
    if (lessonId) return "Lesson Discussion";

    switch (currentFilter) {
      case ForumFilterType.MY_COURSES:
        return "Discussions in My Courses";
      case ForumFilterType.MY_POSTS:
        return "My Posts & Replies";
      case ForumFilterType.MOST_ACTIVE:
        return "Most Active Discussions";
      default:
        return "All Discussions";
    }
  };

  return (
    <div className="forum-page">
      <div className="forum-header">
        <h1>{getPageTitle()}</h1>

        {/* Filter options when not in a specific course/lesson */}
        {!courseId && !lessonId && (
          <div className="forum-filters">
            <button
              className={`filter-btn ${
                currentFilter === ForumFilterType.ALL ? "active" : ""
              }`}
              onClick={() => setCurrentFilter(ForumFilterType.ALL)}
            >
              <Filter size={16} /> All Discussions
            </button>
            <button
              className={`filter-btn ${
                currentFilter === ForumFilterType.MY_COURSES ? "active" : ""
              }`}
              onClick={() => setCurrentFilter(ForumFilterType.MY_COURSES)}
              disabled={!currentUser?.enrolledCourses?.length}
            >
              <MessageCircle size={16} /> My Courses
            </button>
            <button
              className={`filter-btn ${
                currentFilter === ForumFilterType.MY_POSTS ? "active" : ""
              }`}
              onClick={() => setCurrentFilter(ForumFilterType.MY_POSTS)}
            >
              <User size={16} /> My Posts
            </button>
            <button
              className={`filter-btn ${
                currentFilter === ForumFilterType.MOST_ACTIVE ? "active" : ""
              }`}
              onClick={() => setCurrentFilter(ForumFilterType.MOST_ACTIVE)}
            >
              <BarChart2 size={16} /> Most Active
            </button>
          </div>
        )}

        {currentUser && (
          <button
            className="btn-primary new-post-btn"
            onClick={() => setShowNewPostForm(!showNewPostForm)}
          >
            {showNewPostForm ? "Cancel" : "New Discussion"}
          </button>
        )}
      </div>

      {/* New post form */}
      {showNewPostForm && (
        <div className="new-post-container">
          <h2>Start a New Discussion</h2>
          <form onSubmit={handleSubmitPost} className="new-post-form">
            <div className="form-group">
              <label htmlFor="postTitle">Title</label>
              <input
                id="postTitle"
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Enter discussion title"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="postContent">Content</label>
              <textarea
                id="postContent"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Share your thoughts, questions, or insights..."
                rows={5}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Post Discussion
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowNewPostForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="forum-content">
        {loading && !selectedPost ? (
          <div className="loading">Loading discussions...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <p>No discussions found.</p>
            {currentUser && (
              <button
                className="btn-primary"
                onClick={() => setShowNewPostForm(true)}
              >
                Start a Discussion
              </button>
            )}
          </div>
        ) : (
          <div className="forum-layout">
            <div className="posts-list">
              <h2>Discussions ({posts.length})</h2>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`post-item ${
                    selectedPost?.id === post.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectPost(post)}
                >
                  <h3 className="post-title">{post.title}</h3>
                  <div className="post-meta">
                    <span className="post-author">
                      <User size={14} /> {post.authorName}
                    </span>
                    <span className="post-timestamp">
                      <Clock size={14} /> {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <p className="post-preview">
                    {post.content.length > 150
                      ? `${post.content.substring(0, 150)}...`
                      : post.content}
                  </p>
                  <div className="post-stats">
                    <span className="reply-count">
                      <MessageCircle size={14} /> {post.replyCount || 0} replies
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected post and replies */}
            {selectedPost && (
              <div className="post-detail">
                <div className="selected-post">
                  <h2>{selectedPost.title}</h2>
                  <div className="post-meta">
                    <span className="post-author">
                      <User size={16} /> {selectedPost.authorName}
                    </span>
                    <span className="post-timestamp">
                      <Clock size={16} /> {formatDate(selectedPost.createdAt)}
                    </span>
                  </div>
                  <div className="post-content">{selectedPost.content}</div>
                </div>

                <div className="post-replies">
                  <h3>Replies ({replies.length})</h3>

                  {loading ? (
                    <div className="loading">Loading replies...</div>
                  ) : replies.length === 0 ? (
                    <div className="no-replies">No replies yet.</div>
                  ) : (
                    <div className="replies-list">
                      {replies.map((reply) => (
                        <div key={reply.id} className="reply-item">
                          <div className="reply-meta">
                            <span className="reply-author">
                              <User size={14} /> {reply.authorName}
                            </span>
                            <span className="reply-timestamp">
                              <Clock size={14} /> {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <div className="reply-content">{reply.content}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentUser &&
                    (canReply ? (
                      <form onSubmit={handleSubmitReply} className="reply-form">
                        <textarea
                          value={newReplyContent}
                          onChange={(e) => setNewReplyContent(e.target.value)}
                          placeholder="Write your reply..."
                          required
                        />
                        <button type="submit" className="btn-primary">
                          <Send size={16} /> Reply
                        </button>
                      </form>
                    ) : (
                      <div className="permission-notice">
                        Only teachers and administrators can reply to
                        discussions.
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
