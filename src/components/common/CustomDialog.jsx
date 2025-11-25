"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function CustomDialog({ open, onClose, children }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {/* BACKDROP */}
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        
      />

      {/* FULLSCREEN MODAL */}
      <motion.div
        className="
          fixed inset-0
          bg-white
          flex flex-col
          overflow-hidden
        "
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
