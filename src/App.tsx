/// <reference types="vite/client" />
import { useCallback, useEffect, useMemo, useState } from "react";
import { PersonStanding, Download, Sun, Moon, Menu, X } from "lucide-react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import { FEATURES, PROFILE } from "./config";
import type { Post } from "./types";
import { loadPosts, sortByDateDesc } from "./lib/blog";
import { useTheme } from "./lib/theme";
import { useAppNavigation } from "./lib/navigation";
import Button from "./components/ui/Button";
import BlogCinemaBanner from "./components/blog/BlogCinemaBanner";

// pages
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdventPage from "./pages/AdventOfDataPage";
import AdventProblemPage from "./pages/AdventOfDataProblemPage";

export default function App(): React.ReactElement {
  const [theme, setTheme] = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const { navigateTo } = useAppNavigation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 text-neutral-900 dark:from-neutral-950 dark:to-neutral-900 dark:text-neutral-50">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 relative">
          {/* Brand */}
          <Link
            to="/home"
            className="flex items-center gap-2 text-sm font-semibold"
            aria-label="Go to homepage"
            onClick={() => setMobileOpen(false)}
          >
            <PersonStanding className="h-5 w-5" /> {PROFILE.name}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden gap-6 sm:flex" aria-label="Primary">
            {/* ADVENT LINK */}
            <Link to="/advent" className="text-sm relative" onClick={() => setMobileOpen(false)}>
              Advent Calendar 2025
              <span
                aria-label="New page"
                className="
                  absolute -top-2 -left-8 z-10 select-none rounded-full bg-pink-600
                  px-2 py-1 text-[7px] font-extrabold uppercase tracking-widest text-white shadow-lg
                  ring-2 ring-white/60 dark:ring-black/40
                "
              >
                New 
              </span>
            </Link>
            {FEATURES.blog && (
              <Link to="/blog" className="text-sm" onClick={() => setMobileOpen(false)}>
                Blog
              </Link>
            )}
            {FEATURES.services && (
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileOpen(false);
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
                  setMobileOpen(false);
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
                  setMobileOpen(false);
                  goHomeAndScrollTo("certs");
                }}
                className="text-sm"
              >
                Certifications
              </a>
            )}
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                goHomeAndScrollTo("contact");
              }}
              className="text-sm"
            >
              Contact
            </a>
          </nav>

          {/* Right actions (always visible) */}
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

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300/60 dark:border-neutral-700/60"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile panel */}
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <div
                className="sm:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
                onClick={() => setMobileOpen(false)}
              />
              {/* Sheet */}
              <div className="sm:hidden absolute left-0 right-0 top-full z-40 border-b border-neutral-200/70 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95">
                <div className="px-4 py-3 flex flex-col gap-3 text-sm">
                  <Link 
                    to="/advent"
                    className="px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    Advent 2025
                  </Link>
                  {FEATURES.services && (
                    <button
                      className="text-left px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={() => {
                        setMobileOpen(false);
                        goHomeAndScrollTo("services");
                      }}
                    >
                      Collaborate
                    </button>
                  )}
                  {FEATURES.sideProjects && (
                    <button
                      className="text-left px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={() => {
                        setMobileOpen(false);
                        goHomeAndScrollTo("projects");
                      }}
                    >
                      Projects
                    </button>
                  )}
                  {FEATURES.certs && (
                    <button
                      className="text-left px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={() => {
                        setMobileOpen(false);
                        goHomeAndScrollTo("certs");
                      }}
                    >
                      Certifications
                    </button>
                  )}
                  {FEATURES.blog && (
                    <Link
                      to="/blog"
                      className="px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={() => setMobileOpen(false)}
                    >
                      Blog
                    </Link>
                  )}
                  <button
                    className="text-left px-2 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => {
                      setMobileOpen(false);
                      goHomeAndScrollTo("contact");
                    }}
                  >
                    Contact
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>
      {/* Floating blog banner */}
      <BlogCinemaBanner posts={posts} onPick={(slug) => navigate(`/blog/${slug}`)} show />

      {/* ROUTES */}
      <Routes>
        <Route
          path="/"
          element={<HomePage posts={posts} latestPosts={latestPosts} navigate={navigateTo} />}
        />
        <Route
          path="/home"
          element={<HomePage posts={posts} latestPosts={latestPosts} navigate={navigateTo} />}
        />
        <Route
          path="/blog"
          element={
            <BlogPage
              posts={posts}
              loading={loading}
              query={query}
              setQuery={setQuery}
              navigate={navigateTo}
            />
          }
        />
        <Route
          path="/blog/:slug"
          element={<BlogPostPage theme={theme} posts={posts} />} // see tiny change below
        />
        <Route path="/advent" element={<AdventPage />} />
        <Route path="/advent/:day" element={<AdventProblemPage />} />
        {/* fallback */}
        {/* <Route path="*" element={<HomePage posts={posts} latestPosts={latestPosts} navigate={navigateTo} />} /> */}
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
