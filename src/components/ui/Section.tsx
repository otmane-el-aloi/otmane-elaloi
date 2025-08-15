import React from "react";
import { motion } from "framer-motion";
import { sectionVariants } from "../../lib/motion";

export default function Section({
  id, title, kicker, children,
}: { id?: string; title: string; kicker?: string; children?: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      className="mx-auto max-w-6xl px-4 py-12 sm:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionVariants}
    >
      <div className="mb-8">
        {kicker && (
          <div className="mb-2 text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            {kicker}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}
