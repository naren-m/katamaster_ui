import { motion } from 'framer-motion';

type MotivationalMessageProps = {
  message: string;
};

const MotivationalMessage = ({ message }: MotivationalMessageProps) => {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-yellow-100 border-l-4 border-yellow-500 p-4 my-4 rounded-lg"
    >
      <p className="text-lg font-bold text-center text-yellow-800" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
        {message}
      </p>
    </motion.div>
  );
};

export default MotivationalMessage;