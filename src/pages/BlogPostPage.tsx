// src/pages/BlogPostPage.tsx
import React, { useEffect, useRef } from "react";
import Button from "../components/ui/Button";
import BlogPost from "../components/blog/BlogPost";
import Comments from "../components/blog/Comments";
import type { Post, RouteName, Route } from "../types";
import { renderMermaid } from "../lib/blog"; // ⬅️ new import

export default function BlogPostPage({
  currentPost,
  theme,
  navigate,
}: {
  currentPost: Post | null;
  theme: "light" | "dark";
  navigate: (name: RouteName, params?: Route["params"]) => void;
}) {
  const postRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderMermaid(postRef.current);
  }, [currentPost?.slug, theme]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-4 flex items-center gap-2">
        <Button onClick={() => navigate("blog")}>Back</Button>
      </div>

      {currentPost ? (
        <div ref={postRef}>
          <BlogPost post={currentPost} onBack={() => navigate("blog")} />
          <Comments slug={currentPost.slug} theme={theme} />
        </div>
      ) : (
        <article className="rounded-2xl border p-6 text-sm dark:border-neutral-800">
          <h1 className="mb-2 text-xl font-semibold">Post not found</h1>
          <p className="mb-4 text-neutral-600 dark:text-neutral-300">
            The article you’re looking for doesn’t exist or has been moved.
          </p>
          <Button onClick={() => navigate("blog")}>Back to Blog</Button>
        </article>
      )}
    </main>
  );
}
