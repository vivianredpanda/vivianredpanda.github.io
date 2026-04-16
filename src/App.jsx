import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SceneTransition from './components/shared/SceneTransition';
import BackButton from './components/shared/BackButton';
import CozyRoom from './components/scenes/CozyRoom';
import AquariumScene from './components/scenes/AquariumScene';
import GardenScene from './components/scenes/GardenScene';
import KitchenScene from './components/scenes/KitchenScene';
import StudyScene from './components/scenes/StudyScene';
import KitchenJarEditor from './components/kitchen/KitchenJarEditor';
import RecipeEditor from './components/kitchen/RecipeEditor';
import BookEditor from './components/study/BookEditor';
import './App.css';

const SCENES = {
  room: CozyRoom,
  aquarium: AquariumScene,
  garden: GardenScene,
  kitchen: KitchenScene,
  study: StudyScene,
};

export default function App() {
  const params = new URLSearchParams(window.location.search);

  // Use 'scene' param from URL if it exists, otherwise default to 'room'
  const [currentScene, setCurrentScene] = useState(params.get('scene') || 'room');
  const [windowRatio, setWindowRatio] = useState(window.innerHeight / window.innerWidth);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowRatio(window.innerHeight / window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide back button ONLY when in portrait mode AND a recipe overlay is open
  const isPortrait = windowRatio > 1.2;
  const shouldHideBack = currentScene === 'kitchen' && isOverlayOpen && isPortrait;
  const showBackButton = currentScene !== 'room' && !shouldHideBack;

  const navigateTo = (scene) => setCurrentScene(scene);
  const goHome = () => setCurrentScene('room');

  if (params.has('jar-editor')) return <KitchenJarEditor />;
  if (params.has('recipe-editor')) return <RecipeEditor />;
  if (params.has('book-editor')) return <BookEditor />;

  const SceneComponent = SCENES[currentScene];

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <SceneTransition sceneKey={currentScene}>
        <SceneComponent navigateTo={navigateTo} goHome={goHome} setOverlayOpen={setIsOverlayOpen} />
      </SceneTransition>

      <AnimatePresence>
        {showBackButton && (
          <BackButton key="back-btn" onClick={goHome} />
        )}
      </AnimatePresence>
    </div>
  );
}
