import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  action?: ReactNode;
}

export function PageWrapper({ children, title, action }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-24"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold font-display text-slate-900 tracking-tight">{title}</h1>
        {action && <div>{action}</div>}
      </div>
      {children}
    </motion.div>
  );
}
