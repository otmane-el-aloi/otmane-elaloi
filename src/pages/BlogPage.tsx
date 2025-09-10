import Button from "../components/ui/Button";
import BlogList from "../components/blog/BlogList";
import type { Post, RouteName, Route } from "../types";
import { BookOpen, Home } from "lucide-react";

export default function BlogPage({
  posts,
  loading,
  query,
  setQuery,
  navigate,
}: {
  posts: Post[];
  loading: boolean;
  query: string;
  setQuery: (q: string) => void;
  navigate: (name: RouteName, params?: Route["params"]) => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen />
          <h1 className="text-2xl sm:text-3xl font-bold">Blog</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("home")}>
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>
      </div>
      <BlogList
        posts={posts}
        onOpen={(p) => navigate("post", { slug: p.slug })}
        query={query}
        setQuery={setQuery}
        loading={loading}
      />
    </main>
  );
}
