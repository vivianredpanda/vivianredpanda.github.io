import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Recipes() {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      name: 'Matcha Tiramisu',
      description: 'A modern twist on the classic Italian dessert with earthy matcha layers.',
      emoji: '🍵',
      difficulty: 'Medium',
      time: '45 min',
      tags: ['Dessert', 'No-bake', 'Vegetarian'],
    },
    {
      id: 2,
      name: 'Miso Butter Pasta',
      description: 'Creamy, umami-rich pasta with garlic, miso, and crispy sage.',
      emoji: '🍝',
      difficulty: 'Easy',
      time: '20 min',
      tags: ['Quick', 'Vegan', 'Comfort Food'],
    },
    {
      id: 3,
      name: 'Roasted Vegetable Buddha Bowl',
      description: 'Colorful, nutrient-dense bowl with seasonal roasted vegetables and tahini dressing.',
      emoji: '🥗',
      difficulty: 'Easy',
      time: '30 min',
      tags: ['Healthy', 'Vegan', 'Bowl'],
    },
    {
      id: 4,
      name: 'Cardamom Coffee Cake',
      description: 'Soft, aromatic cake with warm cardamom spice and a cinnamon crumb topping.',
      emoji: '🍰',
      difficulty: 'Medium',
      time: '1 hour',
      tags: ['Breakfast', 'Dessert', 'Coffee Pairing'],
    },
    {
      id: 5,
      name: 'Ginger-Soy Tofu Stir-fry',
      description: 'Quick, flavorful stir-fry with crispy tofu and fresh ginger.',
      emoji: '🥘',
      difficulty: 'Easy',
      time: '25 min',
      tags: ['Quick', 'Vegan', 'Asian'],
    },
    {
      id: 6,
      name: 'Lavender Lemonade',
      description: 'Refreshing, floral drink perfect for summer gatherings.',
      emoji: '🍹',
      difficulty: 'Easy',
      time: '10 min',
      tags: ['Beverage', 'Vegan', 'Refreshing'],
    },
  ]);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

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
    <section id="recipes" className="py-20 bg-gradient-to-b from-cream to-white" ref={ref}>
      <div className="max-w-5xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center mb-4"
        >
          Recipe Cookbook
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          A collection of my favorite recipes. Each one is tested, loved, and ready to inspire your next meal.
        </motion.p>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {recipes.map(recipe => (
            <motion.button
              key={recipe.id}
              variants={itemVariants}
              onClick={() => setSelectedRecipe(recipe)}
              className="card text-left hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-3">{recipe.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{recipe.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-warm-100 text-warm-600 px-2 py-1 rounded-full">
                  {recipe.difficulty}
                </span>
                <span className="text-xs bg-ocean-100 text-ocean-600 px-2 py-1 rounded-full">
                  {recipe.time}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {recipe.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-500 px-2 py-1 rounded-full bg-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Recipe modal */}
      {selectedRecipe && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRecipe(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md max-h-96 overflow-y-auto"
          >
            <div className="text-6xl mb-4">{selectedRecipe.emoji}</div>
            <h2 className="text-2xl font-bold mb-2">{selectedRecipe.name}</h2>
            <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>{selectedRecipe.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span>{selectedRecipe.difficulty}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {selectedRecipe.tags.map(tag => (
                <span key={tag} className="bg-warm-100 text-warm-600 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => setSelectedRecipe(null)}
              className="w-full btn"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
