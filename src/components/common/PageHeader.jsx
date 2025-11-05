"use client";

import { motion } from "framer-motion";

export default function PageHeader({ title, description, icon: Icon }) {
  // 🎬 Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        delay: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="flex flex-col md:flex-row justify-between md:items-center gap-3"
    >
      <div className="space-y-1">
        <motion.h1
          variants={fadeUp}
          className="text-3xl font-bold tracking-tight flex items-center gap-2"
        >
          {Icon && (
            <motion.span
              initial={{ rotate: -15, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            >
              <Icon className="h-7 w-7 text-blue-600" />
            </motion.span>
          )}
          {title}
        </motion.h1>

        {description && (
          <motion.p
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
