import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Aquarium from './Aquarium';

export default function AquariumSection() {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section className="py-20 bg-gradient-to-b from-white to-cream" ref={ref}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-4"
        >
          Zen Aquarium 🐠
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Take a moment to relax and watch the fish swim by. Sometimes the best ideas come when we pause for a moment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
        >
          <Aquarium />
        </motion.div>
      </div>
    </section>
  );
}
