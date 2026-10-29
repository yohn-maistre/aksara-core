// Adapted from Cult UI expandable-screen, d71b142 (MIT).
// Shared expansion/fade presentation; Base UI owns controlled state, focus,
// Escape, scroll locking and restoration. No retained private exit content.
import { Dialog } from "@base-ui/react/dialog";
import { motion, useReducedMotion } from "motion/react";
export const ExpandableScreen = Dialog.Root;
export function ExpandableScreenContent(props: Dialog.Popup.Props) {
  const reduced = useReducedMotion();
  return (
    <Dialog.Popup
      {...props}
      render={
        <motion.div
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: [0.23, 1, 0.32, 1] }}
        />
      }
    />
  );
}
