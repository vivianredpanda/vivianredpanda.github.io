import { motion } from 'framer-motion';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-warm-400 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-br from-ocean-400 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <motion.div
        className="relative z-10 text-center max-w-3xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <div className="text-6xl mb-4">🐼</div>
          <h1 className="text-5xl md:text-7xl font-bold">
            Hi, I'm <span className="gradient-text">Vivian</span>
          </h1>
        </motion.div>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-700 mb-2">
          Full-stack developer & creative builder
        </motion.p>

        <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto">
          I love turning ideas into beautiful, functional web experiences. When I'm not coding, you'll find me exploring new recipes or enjoying a good aquarium. 🐠
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex gap-4 justify-center flex-wrap"
        >
          <a href="#projects" className="btn">
            View My Work
          </a>
          <a href="#recipes" className="btn btn-secondary">
            Explore Recipes
          </a>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex justify-center gap-6"
        >
          <a href="https://github.com/vivianredpanda" target="_blank" rel="noopener noreferrer" className="text-3xl hover:scale-125 transition-transform">
            🔗
          </a>
          <a href="#contact" className="text-3xl hover:scale-125 transition-transform">
            💌
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-2xl">↓</div>
      </motion.div>
    </section>
  );
}
