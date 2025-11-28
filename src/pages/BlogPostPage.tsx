import { useEffect, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import BlogPost from "../components/blog/BlogPost";
import Comments from "../components/blog/Comments";
import { renderMermaid } from "../lib/blog";
import type { RootOutletContext } from "../routes/root";

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const postRef = useRef<HTMLDivElement>(null);
  const { posts, theme } = useOutletContext<RootOutletContext>();

  const currentPost = posts.find((p) => p.slug === slug) || null;

  useEffect(() => {
    renderMermaid(postRef.current);
  }, [currentPost?.slug, theme]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      {currentPost ? (
        <div ref={postRef}>
          <BlogPost post={currentPost} onBack={() => navigate("/blog")} />
          <Comments slug={currentPost.slug} theme={theme} />
        </div>
      ) : (
        <article className="rounded-2xl border p-6 text-sm dark:border-neutral-800">
          <h1 className="mb-2 text-xl font-semibold">Post not found</h1>
          <p className="mb-4 text-neutral-600 dark:text-neutral-300">
            The article you’re looking for doesn’t exist or has been moved.
          </p>
          <Button onClick={() => navigate("/blog")}>Back to Blog</Button>
        </article>
      )}
    </main>
  );
}
