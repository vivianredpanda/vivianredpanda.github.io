import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-warm-900 text-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mb-8"
        >
          <div>
            <h3 className="text-xl font-bold mb-4">Vivian</h3>
            <p className="opacity-90">Building beautiful experiences on the web, one pixel at a time.</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 opacity-90">
              <li>
                <a href="#about" className="hover:text-warm-200 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-warm-200 transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#recipes" className="hover:text-warm-200 transition-colors">
                  Recipes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="flex gap-4 text-2xl">
              <a
                href="https://github.com/vivianredpanda"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-125 transition-transform"
                title="GitHub"
              >
                🐙
              </a>
              <a
                href="mailto:hello@example.com"
                className="hover:scale-125 transition-transform"
                title="Email"
              >
                💌
              </a>
              <a
                href="#"
                className="hover:scale-125 transition-transform"
                title="LinkedIn"
              >
                🔗
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="border-t border-warm-800 pt-8 text-center opacity-75"
        >
          <p>
            © {currentYear} Vivian. Crafted with ❤️ and a dash of creativity.
          </p>
          <p className="text-sm mt-2">Built with React • Powered by caffeine & curiosity</p>
        </motion.div>
      </div>
    </footer>
  );
}
