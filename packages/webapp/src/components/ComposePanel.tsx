import React, { useState, useEffect, useRef } from 'react';
import type { NewsPublishedEvent } from '../types';
import { Icon } from './icons';
import { ICON_SET, type IconName } from '../constants';

interface ComposePanelProps {
  latestDate: string;
  onSubmit: (event: NewsPublishedEvent) => void;
  isLoading: boolean;
}

const getNextDay = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().split('T')[0];
};

export const ComposePanel: React.FC<ComposePanelProps> = ({ latestDate, onSubmit, isLoading }) => {
  const [date, setDate] = useState(getNextDay(latestDate));
  const [icon, setIcon] = useState<IconName>('Landmark');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDate(getNextDay(latestDate));
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
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-beige-200 z-20">
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="relative" ref={iconPickerRef}>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="p-2.5 rounded-lg bg-beige-100 hover:bg-beige-200 transition"
                aria-haspopup="true"
                aria-expanded={showIconPicker}
              >
                <Icon name={icon} className="w-5 h-5 text-stone-600"/>
              </button>
              {showIconPicker && (
                <div className="absolute bottom-full mb-2 w-64 bg-white border border-beige-200 rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1">
                  {ICON_SET.map(i => (
                    <button key={i} type="button" onClick={() => handleIconSelect(i)} className="p-2 rounded-md hover:bg-beige-100 flex justify-center items-center" title={i}>
                      <Icon name={i} className="w-5 h-5 text-stone-600" />
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
              className="flex-grow bg-beige-100 border border-beige-200 rounded-lg px-4 py-2 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition"
              required
            />
          </div>
          <div className="flex items-end space-x-3">
            <textarea
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-grow bg-beige-100 border border-beige-200 rounded-lg px-4 py-2 text-stone-800 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition resize-none"
              rows={2}
              required
            />
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition flex-shrink-0"
              aria-label="Submit new event"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
