/**
 * Tutorial/onboarding modal for first-time users
 */
import React from 'react';
import { Icon } from './icons';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Icon name="Lightbulb" className="w-6 h-6 text-amber-700" />
            </div>
            <h2 id="tutorial-title" className="text-2xl font-semibold text-stone-900">
              Welcome to AI Forecasting Simulation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
            aria-label="Close tutorial"
          >
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Icon name="Target" className="w-5 h-5 text-amber-600" />
              Your Mission
            </h3>
            <p className="text-stone-700 leading-relaxed">
              You are a US government strategist navigating AI governance scenarios from 2025-2035.
              Your decisions shape the timeline, and an AI-powered Game Master (GM) responds with
              realistic forecasts and consequences.
            </p>
          </section>

          {/* How to Play */}
          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Icon name="PlayCircle" className="w-5 h-5 text-amber-600" />
              How to Play
            </h3>
            <ol className="space-y-3 text-stone-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </span>
                <div>
                  <strong className="text-stone-900">Review the Timeline:</strong> Scroll through
                  events organized by year and month. Click any event to expand details.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </span>
                <div>
                  <strong className="text-stone-900">Make Your Move:</strong> Use the compose
                  panel at the bottom to create policy decisions, executive orders, or other
                  government actions.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </span>
                <div>
                  <strong className="text-stone-900">GM Responds:</strong> The AI forecaster
                  analyzes your action and generates realistic consequences, new developments,
                  and world reactions.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </span>
                <div>
                  <strong className="text-stone-900">Iterate:</strong> Continue making decisions
                  until the scenario reaches a conclusion (game-over event).
                </div>
              </li>
            </ol>
          </section>

          {/* Key Features */}
          <section>
            <h3 className="text-lg font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Icon name="Sparkles" className="w-5 h-5 text-amber-600" />
              Key Features
            </h3>
            <div className="grid gap-3">
              <div className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                <div className="flex items-start gap-2">
                  <Icon name="Search" className="w-4 h-4 text-stone-600 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 text-sm">Search:</strong>
                    <span className="text-stone-600 text-sm ml-1">
                      Filter events by keywords using the search bar in the header.
                    </span>
                  </div>
                </div>
              </div>
              <div className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                <div className="flex items-start gap-2">
                  <Icon name="Download" className="w-4 h-4 text-stone-600 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 text-sm">Export/Import:</strong>
                    <span className="text-stone-600 text-sm ml-1">
                      Save your timeline as JSON or load a saved scenario.
                    </span>
                  </div>
                </div>
              </div>
              <div className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                <div className="flex items-start gap-2">
                  <Icon name="Eye" className="w-4 h-4 text-stone-600 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 text-sm">Hidden Events:</strong>
                    <span className="text-stone-600 text-sm ml-1">
                      The GM may create hidden developments revealed only at game end.
                    </span>
                  </div>
                </div>
              </div>
              <div className="border border-stone-200 rounded-lg p-3 bg-stone-50">
                <div className="flex items-start gap-2">
                  <Icon name="Clock" className="w-4 h-4 text-stone-600 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 text-sm">Auto-Save:</strong>
                    <span className="text-stone-600 text-sm ml-1">
                      Your progress is automatically saved to your browser.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-md font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <Icon name="AlertCircle" className="w-4 h-4" />
              Pro Tips
            </h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Be specific in your policy descriptions for more realistic GM responses.</li>
              <li>• Consider both domestic and international implications of your actions.</li>
              <li>• The GM may introduce unexpected events - adapt your strategy accordingly.</li>
              <li>• Review the post-game analysis to see what happened behind the scenes.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
