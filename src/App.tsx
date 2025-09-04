/// <reference types="vite/client" />
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Github,
  Linkedin,
  Mail,
  Moon,
  Sun,
  ExternalLink,
  ArrowRight,
  Download,
  Home,
  PersonStanding,
  Award,
  BookOpen,
} from "lucide-react";
import {FEATURES, PROFILE, SKILLS, CERTS, SELECTED_WORK, SIDE_PROJECTS } from "./config";
import type { Post, Route, RouteName } from "./types";
import { loadPosts, sortByDateDesc } from "./lib/blog";
import { useTheme } from "./lib/theme";
import Section from "./components/ui/Section";
import Button from "./components/ui/Button";
import Badge from "./components/ui/Badge";
import BlogList from "./components/blog/BlogList";
import BlogPost from "./components/blog/BlogPost";
import BlogSpotlight from "./components/blog/BlogSpotlight";
import BlogCinemaBanner from "./components/blog/BlogCinemaBanner";
import { motion } from "framer-motion";
import { listContainer, listItem } from "./lib/motion";
import Comments from "./components/blog/Comments";

function formatMonth(dateISO: string): string {
  try {
    return new Date(dateISO).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    });
  } catch {
    return dateISO;
  }
}

export default function App(): React.ReactElement {
  const [theme, setTheme] = useTheme();
  const [route, setRoute] = useState<Route>(() => {
    const stored = localStorage.getItem("route");
    return stored ? JSON.parse(stored) : { name: "home" };
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
  const goHomeAndScrollTo = useCallback((id: string) => {
    navigate("home");
    // Defer until layout paints
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }, [navigate]);

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
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

          </div>
        </div>
      </header>

      {/* Floating blog banner */}
      <BlogCinemaBanner posts={posts} onPick={(slug) => navigate("post", { slug })} show={route.name !== "post"} />

      {/* HOME */}
      {route.name === "home" && (
        <main>
          <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:py-20">
            <h1 className="text-3xl font-bold sm:text-5xl">{PROFILE.title}</h1>
            <p className="max-w-2xl text-neutral-600 dark:text-neutral-300">{PROFILE.headline}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button as="a" href={`mailto:${PROFILE.email}`}>
                <Mail className="h-4 w-4" /> Contact me
              </Button>
              <Button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
                Let&apos;s collaborate <ArrowRight className="h-4 w-4" />
              </Button>
              <a
                href={PROFILE.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a
                href={PROFILE.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          </section>

          {FEATURES.blog && posts.length > 0 && (
          <BlogSpotlight
            posts={posts}
            onOpen={(p) => navigate("post", { slug: p.slug })}
            onViewAll={() => navigate("blog")}
          />)}
          {FEATURES.skills && (
          <Section id="skills" title="Core Skills" kicker="Principles & capabilities">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {SKILLS.map(({ icon: Icon, label, notes }) => (
                <motion.div
                  key={label}
                  className="rounded-2xl border p-4 transition hover:shadow dark:border-neutral-800"
                  variants={listItem}
                >
                  <div className="mb-1 inline-flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-5 w-5" /> {label}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{notes}</div>
                </motion.div>
              ))}
            </motion.div>
          </Section>)}

          {FEATURES.services && (
          <Section id="services" title="Let’s collaborate" kicker="Open to new data challenges">
            <div className="rounded-2xl border p-6 dark:border-neutral-800">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                I’m open to exchange about data topics and to take on new challenges. If you have an idea, a tricky issue,
                or you just want a second pair of eyes—let’s talk.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SKILLS.map((s) => (
                  <Badge key={s.label}>{s.label}</Badge>
                ))}
              </div>
              <div className="mt-4">
                <Button
                  as="a"
                  href={`mailto:${PROFILE.email}?subject=${encodeURIComponent("Collaboration inquiry")}`}
                >
                  Reach out <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Section>)}
          
          {FEATURES.selectedWork && (
          <Section id="projects" title="Selected Work" kicker="Real-world impact">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {SELECTED_WORK.map((c) => (
                <motion.div key={c.title} className="rounded-2xl border p-4 dark:border-neutral-800" variants={listItem}>
                  <h3 className="mb-2 text-lg font-semibold">{c.title}</h3>
                  <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">{c.summary}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {c.stack.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  {c.link && (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
                    >
                      View details <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </Section>)}
            
          {FEATURES.sideProjects && (
          <Section id="side-projects" title="Side Projects" kicker="Exploration & Open Source">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {SIDE_PROJECTS.map((p) => (
                <motion.div key={p.title} className="rounded-2xl border p-4 dark:border-neutral-800" variants={listItem}>
                  <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
                  <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">{p.summary}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
                    >
                      View on GitHub <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </Section>)}
          
          {FEATURES.certs && (
          <Section id="certs" title="Certifications" kicker="Validated expertise">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {CERTS.map((c) => (
                <motion.div key={c.name} className="rounded-2xl border p-5 dark:border-neutral-800" variants={listItem}>
                  <div className="mb-3 flex items-center gap-3">
                    {c.logo && <img src={c.logo} alt={c.issuer} className="h-10 w-10 rounded" />}
                    <div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{c.issuer}</div>
                      <h3 className="text-base font-semibold">{c.name}</h3>
                    </div>
                  </div>
                  <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                    Issued {formatMonth(c.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button as="a" href={c.credentialUrl} target="_blank" rel="noopener noreferrer">
                      Verify credential <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Badge>
                      <Award className="mr-1 h-3 w-3" /> {c.issuer}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </Section>)}
          
          {FEATURES.blog && posts.length > 0 && (
          <Section id="latest" title="Latest writing" kicker="From the blog">
            <motion.div
              className="grid gap-4 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={listContainer}
            >
              {latestPosts.map((p) => (
                <motion.article
                  key={p.id}
                  className="rounded-2xl border p-4 transition hover:shadow dark:border-neutral-800"
                  variants={listItem}
                >
                  <h3 className="mb-2 text-lg font-semibold">{p.title}</h3>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(p.tags || []).map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                  </div>
                  <Button onClick={() => navigate("post", { slug: p.slug })}>
                    Read <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.article>
              ))}
            </motion.div>
            <div className="mt-6">
              <Button onClick={() => navigate("blog")}>Visit the blog</Button>
            </div>
          </Section>)}

          <Section id="contact" title="Contact" kicker="Let’s work together">
            <div className="grid gap-6 md:grid-cols-1">
              <div className="rounded-2xl border p-6 dark:border-neutral-800">
                <h3 className="mb-2 text-lg font-semibold">Get in touch</h3>
                <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
                  Send a quick note about your data stack and goals. I’ll reply within 24h.
                </p>
                <div className="flex flex-col gap-3 text-sm">
                  <a
                    href={`mailto:${PROFILE.email}`}
                    className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
                  >
                    <Mail className="h-4 w-4" /> {PROFILE.email}
                  </a>
                  <a
                    href={PROFILE.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                  <a
                    href={PROFILE.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 underline-offset-4 hover:underline"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                </div>
              </div>
            </div>
          </Section>
        </main>
      )}

      {/* BLOG ROUTES */}
      {route.name === "blog" && (
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
      )}

      {/* BLOG POSTS */}
      {route.name === "post" && (
        <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <div className="mb-4 flex items-center gap-2">
            <Button onClick={() => navigate("blog")}>Back</Button>
          </div>
          {currentPost ? (
            <>
              <BlogPost post={currentPost} onBack={() => navigate("blog")} />
              <Comments slug={currentPost.slug} theme={theme} />
            </>
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
