import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-black',
    green: 'text-black',
    red: 'text-black',
    yellow: 'text-black',
    purple: 'text-black',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <p className="text-3xl font-semibold text-black">{value}</p>
          {change && (
            <p className="text-sm text-gray-400 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-2 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;