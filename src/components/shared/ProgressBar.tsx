import { motion } from 'framer-motion';

type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
};

const ProgressBar = ({
  value,
  max,
  color = 'orange',
  height = 8,
  showLabel = true
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'blue': return 'bg-blue-500';
      default: return 'bg-orange-500';
    }
  };

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full" style={{ height: `${height}px` }}>
        <motion.div
          className={`${getColorClass()} rounded-full`}
          style={{ height: `${height}px` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-right mt-1 text-gray-600">
          {value} / {max}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;