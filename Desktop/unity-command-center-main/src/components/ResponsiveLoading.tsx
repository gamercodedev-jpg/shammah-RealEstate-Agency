import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ResponsiveLoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

const ResponsiveLoading = ({ 
  size = "md", 
  text = "Loading...", 
  className = "" 
}: ResponsiveLoadingProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={`${sizeClasses[size]} text-primary`} />
      </motion.div>
      {text && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`${textSizes[size]} text-muted-foreground`}
        >
          {text}
        </motion.span>
      )}
    </motion.div>
  );
};

export default ResponsiveLoading;
