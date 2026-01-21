import React, { useState, useEffect, useRef } from 'react';
import { incrementDateByOne } from '@/engine/utils/strings';
import { ScenarioEvent } from '../types';
import { Icon } from './icons';
import { ICON_SET, type IconName } from '../constants';

interface ComposePanelProps {
  latestDate: string;
  onSubmit: (event: ScenarioEvent) => void;
  isLoading: boolean;
}

export const ComposePanel: React.FC<ComposePanelProps> = ({ latestDate, onSubmit, isLoading }) => {
  const [date, setDate] = useState(incrementDateByOne(latestDate));
  const [icon, setIcon] = useState<IconName>('Landmark');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDate(incrementDateByOne(latestDate));
  }, [latestDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target as Node)) {
        setShowIconPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || isLoading) return;
    onSubmit({ type: 'news-published', date, icon, title, description });
    setTitle('');
    setDescription('');
  };

  const handleIconSelect = (selectedIcon: IconName) => {
    setIcon(selectedIcon);
    setShowIconPicker(false);
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-800 border-t border-beige-200 dark:border-stone-700 z-20">
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="relative" ref={iconPickerRef}>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="p-2.5 rounded-lg bg-beige-100 dark:bg-stone-700 hover:bg-beige-200 dark:hover:bg-stone-600 transition"
                aria-haspopup="true"
                aria-expanded={showIconPicker}
                aria-label="Select event icon"
              >
                <Icon name={icon} className="w-5 h-5 text-stone-600 dark:text-stone-400"/>
              </button>
              {showIconPicker && (
                <div className="absolute bottom-full mb-2 w-64 bg-white dark:bg-stone-800 border border-beige-200 dark:border-stone-700 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1" role="menu">
                  {ICON_SET.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleIconSelect(i)}
                      className="p-2 rounded-md hover:bg-beige-100 dark:hover:bg-stone-700 flex justify-center items-center"
                      title={i}
                      aria-label={`Select ${i} icon`}
                      role="menuitem"
                    >
                      <Icon name={i} className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-grow bg-beige-100 dark:bg-stone-700 border border-beige-200 dark:border-stone-600 rounded-lg px-4 py-2 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition"
              required
              aria-label="Event title"
            />
          </div>
          <div className="flex items-end space-x-3">
            <textarea
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-grow bg-beige-100 dark:bg-stone-700 border border-beige-200 dark:border-stone-600 rounded-lg px-4 py-2 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition resize-none"
              rows={2}
              required
              aria-label="Event description"
            />
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition flex-shrink-0"
              aria-label="Submit new event"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
              ) : (
                <Icon name="Send" className="w-6 h-6" />
              )}
            </button>
          </div>
        </form>
      </div>
    </footer>
  );
};
