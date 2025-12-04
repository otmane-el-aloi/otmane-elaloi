import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Button from "../../../components/ui/Button";
import BlogList from "../components/BlogList";
import type { RootOutletContext } from "../../../routes/root";
import { BookOpen, Home } from "lucide-react";

export default function BlogPage() {
  const { posts } = useOutletContext<RootOutletContext>();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const sortedPosts = useMemo(() => posts, [posts]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen />
          <h1 className="text-2xl sm:text-3xl font-bold">Blog</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/")}>
            <Home className="h-4 w-4" /> Home
          </Button>
        </div>
      </div>
      <BlogList
        posts={sortedPosts}
        onOpen={(p) => navigate(`/blog/${p.slug}`)}
        query={query}
        setQuery={setQuery}
        loading={false}
      />
    </main>
  );
}
