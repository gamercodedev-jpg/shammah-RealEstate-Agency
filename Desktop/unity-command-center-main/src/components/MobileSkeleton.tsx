import { motion } from "framer-motion";

const MobileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      {/* Header Skeleton */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-24 h-6 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </motion.div>

      {/* Main Title Skeleton */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded-full mx-auto animate-pulse" />
      </motion.div>

      {/* Card Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="h-24 bg-gray-200 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};

export default MobileSkeleton;
