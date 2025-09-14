/// <reference types="vite/client" />
import { useCallback, useEffect, useMemo, useState } from "react";
import { PersonStanding, Download, Sun, Moon } from "lucide-react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { FEATURES, PROFILE } from "./config";
import type { Post, Route as AppRoute, RouteName } from "./types";
import { loadPosts, sortByDateDesc } from "./lib/blog";
import { useTheme } from "./lib/theme";
import Button from "./components/ui/Button";
import BlogCinemaBanner from "./components/blog/BlogCinemaBanner";

// pages
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

export default function App(): React.ReactElement {
  const [theme, setTheme] = useTheme();
  const navigate = useNavigate();

  // posts + search
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");

  // load posts
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await loadPosts();
        if (!active) return;
        setPosts(sortByDateDesc(loaded));
      } catch (e) {
        console.error("Failed to load posts:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const latestPosts = useMemo(() => posts.slice(0, 3), [posts]);

  // keep your helper for smooth scroll (works the same)
  const goHomeAndScrollTo = useCallback(
    (id: string) => {
      navigate("/home");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
    },
    [navigate]
  );

  // tiny wrapper to keep your old signature if you still call navigate("post", { slug })
  const navigateOld = useCallback((name: RouteName, params?: AppRoute["params"]) => {
    if (name === "home") navigate("/home");
    else if (name === "blog") navigate("/blog");
    else if (name === "post") navigate(`/blog/${params?.slug ?? ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900 dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-50">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            to="/home"
            className="flex items-center gap-2 text-sm font-semibold"
            aria-label="Go to homepage"
          >
            <PersonStanding className="h-5 w-5" /> {PROFILE.name}
          </Link>

          <nav className="hidden gap-6 sm:flex" aria-label="Primary">
            {FEATURES.services && (
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  goHomeAndScrollTo("services");
                }}
                className="text-sm"
              >
                Collaborate
              </a>
            )}
            {FEATURES.sideProjects && (
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  goHomeAndScrollTo("projects");
                }}
                className="text-sm"
              >
                Projects
              </a>
            )}
            {FEATURES.certs && (
              <a
                href="#certs"
                onClick={(e) => {
                  e.preventDefault();
                  goHomeAndScrollTo("certs");
                }}
                className="text-sm"
              >
                Certifications
              </a>
            )}
            {FEATURES.blog && (
              <Link to="/blog" className="text-sm">
                Blog
              </Link>
            )}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                goHomeAndScrollTo("contact");
              }}
              className="text-sm"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {PROFILE.resumeUrl && PROFILE.resumeUrl !== "#" && (
              <Button
                as="a"
                href={PROFILE.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  theme === "dark"
                    ? "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
                    : "bg-blue-700 text-blue-700 border-neutral-700"
                }
              >
                <Download className="h-4 w-4" /> Resume
              </Button>
            )}
            <Button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className={
                theme === "dark"
                  ? "bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
                  : "bg-blue-700 text-blue-700 border-neutral-700"
              }
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Floating blog banner */}
      <BlogCinemaBanner posts={posts} onPick={(slug) => navigate(`/blog/${slug}`)} show />

      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={<HomePage posts={posts} latestPosts={latestPosts} navigate={navigateOld} />}
        />
        <Route
          path="/home"
          element={<HomePage posts={posts} latestPosts={latestPosts} navigate={navigateOld} />}
        />
        <Route
          path="/blog"
          element={
            <BlogPage
              posts={posts}
              loading={loading}
              query={query}
              setQuery={setQuery}
              navigate={navigateOld}
            />
          }
        />
        <Route
          path="/blog/:slug"
          element={<BlogPostPage theme={theme} posts={posts} />} // see tiny change below
        />
        {/* fallback */}
        <Route path="*" element={<HomePage posts={posts} latestPosts={latestPosts} navigate={navigateOld} />} />
      </Routes>

      {/* FOOTER */}
      <footer className="mt-16 border-t py-8 text-center text-sm text-neutral-500 dark:border-neutral-900">
        <div className="mx-auto max-w-6xl px-4">
          © 2020 - {new Date().getFullYear()} {PROFILE.name || ""} · Data Realm · ❤️
        </div>
      </footer>
    </div>
  );
}
