"use client";

import { motion } from "framer-motion";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
    </motion.header>
  );
}
