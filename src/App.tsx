/// <reference types="vite/client" />
import { useCallback, useEffect, useMemo, useState } from "react";
import { PersonStanding, Download, Sun, Moon } from "lucide-react";
import { FEATURES, PROFILE } from "./config";
import type { Post, Route, RouteName } from "./types";
import { loadPosts, sortByDateDesc } from "./lib/blog";
import { useTheme } from "./lib/theme";
import Button from "./components/ui/Button";
import BlogCinemaBanner from "./components/blog/BlogCinemaBanner";

// NEW: pages
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";


const isValidRoute = (r: any): r is Route => {
  if (!r || typeof r !== "object") return false;
  if (!["home", "blog", "post"].includes(r.name)) return false;
  if (r.name === "post" && (!r.params || typeof r.params.slug !== "string")) return false;
  return true;
};

export default function App(): React.ReactElement {
  const [theme, setTheme] = useTheme();

  // SIMPLE IN-MEMORY ROUTER (unchanged)
  const [route, setRoute] = useState<Route>(() => {
    try {
      const stored = localStorage.getItem("route");
      const parsed = stored ? JSON.parse(stored) : null;
      return isValidRoute(parsed) ? parsed : { name: "home" };
    } catch {
      return { name: "home" };
    }
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");

  // Load posts (with unmount guard)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const loaded = await loadPosts();
        if (!active) return;
        setPosts(sortByDateDesc(loaded));
      } catch (e) {
        // eslint-disable-next-line no-console
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

  const navigate = useCallback((name: RouteName, params?: Route["params"]) => {
    const newRoute = { name, params };
    setRoute(newRoute);
    localStorage.setItem("route", JSON.stringify(newRoute));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const currentPost = useMemo(() => {
    if (route.name !== "post") return null;
    const slug = route.params?.slug;
    return posts.find((p) => p.slug === slug) || null;
  }, [route, posts]);

  // Helpers to scroll to in-page sections from the nav
  const goHomeAndScrollTo = useCallback(
    (id: string) => {
      navigate("home");
      // Defer until layout paints
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
    },
    [navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900 dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-50">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 text-sm font-semibold"
            aria-label="Go to homepage"
          >
            <PersonStanding className="h-5 w-5" /> {PROFILE.name}
          </button>
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
              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("blog");
                }}
                className="text-sm"
              >
                Blog
              </a>
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
      <BlogCinemaBanner posts={posts} onPick={(slug) => navigate("post", { slug })} show={route.name !== "post"} />

      {/* PAGES */}
      {route.name === "home" && (
        <HomePage posts={posts} latestPosts={latestPosts} navigate={navigate} />
      )}

      {route.name === "blog" && (
        <BlogPage
          posts={posts}
          loading={loading}
          query={query}
          setQuery={setQuery}
          navigate={navigate}
        />
      )}

      {route.name === "post" && (
        <BlogPostPage currentPost={currentPost} theme={theme} navigate={navigate} />
      )}

      {/* FOOTER */}
      <footer className="mt-16 border-t py-8 text-center text-sm text-neutral-500 dark:border-neutral-900">
        <div className="mx-auto max-w-6xl px-4">
          © 2020 - {new Date().getFullYear()} {PROFILE.name || ""} · Data Realm · ❤️
        </div>
      </footer>
    </div>
  );
}
