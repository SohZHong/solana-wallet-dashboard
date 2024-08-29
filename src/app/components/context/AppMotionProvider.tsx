'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { AnimatePresenceProps } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, x: 50, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: -50, y: 0 },
};

const AppMotionProvider = ({ children, ...props }: React.PropsWithChildren<AnimatePresenceProps>) => {
  return (
    <AnimatePresence {...props}>
      <motion.main
        key={usePathname()}
        variants={variants}
        initial="hidden"
        animate="enter"
        exit="exit"
        transition={{ type: 'linear' }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

export default AppMotionProvider