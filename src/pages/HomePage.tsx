import { motion } from "framer-motion";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FEATURES, PROFILE, SKILLS, CERTS, SELECTED_WORK, SIDE_PROJECTS } from "../config";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import BlogSpotlight from "../components/blog/BlogSpotlight";
import { listContainer, listItem } from "../lib/motion";
import { ArrowRight, ExternalLink, Github, Linkedin, Mail, Award } from "lucide-react";
import type { RootOutletContext } from "../routes/root";

function formatMonth(dateISO: string): string {
  try {
    return new Date(dateISO).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  } catch {
    return dateISO;
  }
}

export default function HomePage() {
  const { posts, latestPosts } = useOutletContext<RootOutletContext>();
  const navigate = useNavigate();
  return (
    <main>
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center sm:py-20">
        <h1 className="text-3xl font-bold sm:text-5xl">{PROFILE.title}</h1>
        <p className="max-w-2xl text-neutral-600 dark:text-neutral-300">{PROFILE.headline}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button as="a" href={`mailto:${PROFILE.email}`}>
            <Mail className="h-4 w-4" /> Contact me
          </Button>
          <Button
            as={FEATURES.services ? undefined : "a"}
            href={
              FEATURES.services
                ? undefined
                : `mailto:${PROFILE.email}?subject=${encodeURIComponent("Collaboration inquiry")}`
            }
            rel={FEATURES.services ? undefined : "noopener noreferrer"}
            onClick={
              FEATURES.services
                ? () => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
                : undefined
            }
          >
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
          onOpen={(p) => navigate(`/blog/${p.slug}`)}
          onViewAll={() => navigate("/blog")}
        />
      )}

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
        </Section>
      )}

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
              <Button as="a" href={`mailto:${PROFILE.email}?subject=${encodeURIComponent("Collaboration inquiry")}`}>
                Reach out <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Section>
      )}

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
        </Section>
      )}

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
        </Section>
      )}

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
                  {c.isNew && (
                    <span className="ml-2 inline-block rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                      NEW
                    </span>
                  )}
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
        </Section>
      )}

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
                <Button onClick={() => navigate(`/blog/${p.slug}`)}>
                  Read <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.article>
            ))}
          </motion.div>
          <div className="mt-6">
            <Button onClick={() => navigate("/blog")}>Visit the blog</Button>
          </div>
        </Section>
      )}

      <Section id="contact" title="Contact" kicker="Let’s work together">
        <div className="grid gap-6 md:grid-cols-1">
          <div className="rounded-2xl border p-6 dark:border-neutral-800">
            <h3 className="mb-2 text-lg font-semibold">Get in touch</h3>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-300">
              Send a quick note. I’ll reply within 24h. ;)
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a href={`mailto:${PROFILE.email}`} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
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
  );
}
