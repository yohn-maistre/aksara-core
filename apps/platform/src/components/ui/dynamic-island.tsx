// Cult UI dynamic-island (MIT), d71b142: controlled layout/spring presentation.
// Preset demo scheduler and global clip-path IDs replaced by content sizing.
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
export function DynamicIsland({
  children,
  expanded = false,
}: {
  children: ReactNode;
  expanded?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      layout={!reduced}
      className="dynamic-island"
      data-expanded={expanded}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.section>
  );
}
