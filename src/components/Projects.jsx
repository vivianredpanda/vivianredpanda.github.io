import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    fetch('https://api.github.com/users/vivianredpanda/repos?sort=updated&per_page=6')
      .then(res => res.json())
      .then(data => {
        // Filter out forks and archived repos
        const filtered = data.filter(repo => !repo.fork && !repo.archived);
        setRepos(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching repos:', err);
        setLoading(false);
      });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="projects" className="py-20 bg-gradient-to-b from-white to-cream" ref={ref}>
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-4"
        >
          Featured Projects
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Here's a selection of my recent work. Check out my{' '}
          <a
            href="https://github.com/vivianredpanda"
            target="_blank"
            rel="noopener noreferrer"
            className="text-warm-500 hover:text-warm-600 font-semibold"
          >
            GitHub profile
          </a>{' '}
          for more!
        </motion.p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⚙️</div>
            <p className="text-gray-600 mt-4">Loading projects...</p>
          </div>
        ) : repos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No repositories found</p>
          </div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            {repos.map(repo => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                className="card group cursor-pointer"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-warm-500 transition-colors line-clamp-2">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3 min-h-12">
                    {repo.description || 'No description provided'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics && repo.topics.slice(0, 3).map(topic => (
                    <span
                      key={topic}
                      className="bg-blue-100 text-ocean-600 text-xs px-2 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                  {repo.language && (
                    <span className="bg-warm-100 text-warm-600 text-xs px-2 py-1 rounded-full">
                      {repo.language}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    {repo.stargazers_count > 0 && (
                      <span>⭐ {repo.stargazers_count}</span>
                    )}
                    {repo.forks_count > 0 && (
                      <span>🔀 {repo.forks_count}</span>
                    )}
                  </div>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
