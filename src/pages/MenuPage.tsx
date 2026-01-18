/**
 * Pre-game menu - scenario selection and game initialization
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/icons';
import { TutorialModal } from '../components/TutorialModal';

interface MenuPageProps {
  hasExistingGame: boolean;
  onNewGame: () => void;
  onContinueGame: () => void;
}

const TUTORIAL_KEY = 'takeoff-has-seen-tutorial';

export const MenuPage: React.FC<MenuPageProps> = ({ hasExistingGame, onNewGame, onContinueGame }) => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Check if user has seen tutorial before
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_KEY) === 'true';
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_KEY, 'true');
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  const handleNewGame = () => {
    onNewGame();
    navigate('/game');
  };

  const handleContinue = () => {
    onContinueGame();
    navigate('/game');
  };

  return (
    <div className="bg-beige-50 text-stone-800 min-h-screen font-sans flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-3">AI Forecasting Simulation</h1>
          <p className="text-lg text-stone-600">
            Serious policy simulation for AI x-risk scenarios
          </p>
        </div>

        {/* Scenario Card */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Icon name="BrainCircuit" className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-stone-900 mb-2">
                AI X-Risk 2025-2035
              </h2>
              <p className="text-stone-600">
                Navigate AI governance scenarios as the US government. Explore policy decisions
                and their consequences in an interactive timeline simulation.
              </p>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-6">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <span className="font-medium text-stone-700">Your Role:</span>
                <p className="text-stone-600 mt-1">US Government Strategist</p>
              </div>
              <div>
                <span className="font-medium text-stone-700">Start Date:</span>
                <p className="text-stone-600 mt-1">January 2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {hasExistingGame && (
            <button
              onClick={handleContinue}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-3"
            >
              <Icon name="Play" className="w-5 h-5" />
              Continue Game
            </button>
          )}

          <button
            onClick={handleNewGame}
            className={`w-full font-medium py-4 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-3 ${
              hasExistingGame
                ? 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-300'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <Icon name="Plus" className="w-5 h-5" />
            New Game
          </button>
        </div>

        {hasExistingGame && (
          <p className="text-center text-sm text-stone-500 mt-4">
            Starting a new game will replace your current progress
          </p>
        )}

        {/* Help Link */}
        <div className="text-center mt-6">
          <button
            onClick={handleShowTutorial}
            className="text-stone-600 hover:text-amber-700 text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <Icon name="HelpCircle" className="w-4 h-4" />
            How to Play
          </button>
        </div>
      </div>

      <TutorialModal isOpen={showTutorial} onClose={handleCloseTutorial} />
    </div>
  );
};
