import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function About() {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="about" className="bg-gradient-to-b from-cream to-white py-20" ref={ref}>
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center mb-12">
            About Me
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="space-y-4 text-lg">
              <p className="leading-relaxed">
                I'm a passionate full-stack developer with a love for creating beautiful and intuitive web experiences. With expertise in modern web technologies, I transform complex ideas into elegant solutions.
              </p>
              <p className="leading-relaxed">
                Beyond coding, I'm deeply interested in sustainable living, culinary arts, and creating delightful digital experiences. My approach combines technical excellence with thoughtful design.
              </p>
              <p className="leading-relaxed">
                I believe great software comes from understanding both the code and the people who use it. Let's build something amazing together!
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="card">
                <h3 className="text-2xl font-bold mb-4">🚀 Skills</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['React', 'JavaScript', 'Python', 'Node.js', 'Tailwind CSS', 'Git', 'UI/UX Design', 'Web Design'].map((skill) => (
                    <span
                      key={skill}
                      className="bg-gradient-to-r from-warm-300 to-orange-200 text-warm-900 px-4 py-2 rounded-full font-semibold text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-3">✨ Interests</h3>
                <p className="text-gray-700">Web design • Sustainable coding • Recipe development • Data visualization • Creative problem-solving</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
