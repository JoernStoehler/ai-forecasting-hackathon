import React, { useState } from 'react';
import { generateNewsId } from '@/engine/utils/strings';
import { ScenarioEvent } from '../types';
import { Icon } from './icons';

interface EventItemProps {
  event: ScenarioEvent;
  searchQuery?: string;
  isLast: boolean;
  onTelemetry?: (type: 'news-opened' | 'news-closed', targetId: string) => void;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-700 text-stone-800 dark:text-stone-100 px-0.5 rounded-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};


export const EventItem: React.FC<EventItemProps> = ({ event, searchQuery = '', isLast, onTelemetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const resolveTargetId = () => {
    if (event.id) return event.id;
    const type = event.type === 'hidden-news-published' ? 'hidden-news' : 'news';
    return generateNewsId(type, event.date, event.title);
  };

  const handleToggle = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    if (!onTelemetry) return;
    const targetId = resolveTargetId();
    onTelemetry(nextExpanded ? 'news-opened' : 'news-closed', targetId);
  };

  return (
    <div className="flex items-start">
      {/* Icon Gutter */}
      <div className="w-12 flex-shrink-0 flex justify-center pt-1">
        <div className="p-1 rounded-full bg-beige-50 dark:bg-stone-800">
          <Icon
            name={event.icon}
            className="w-5 h-5 text-stone-600 dark:text-stone-400"
          />
        </div>
      </div>
      
      {/* Event Content */}
      <button
        className={`flex-grow text-left cursor-pointer ${isLast ? 'pb-4' : 'pb-6'} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-lg px-2 -mx-2`}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} event: ${event.title}`}
      >
        <div className="flex items-center gap-2 pt-1">
          <h3 className="font-medium leading-tight text-stone-800 dark:text-stone-200">
            {highlightText(event.title, searchQuery)}
          </h3>
        </div>
        {isExpanded && (
          <div className="mt-2 leading-relaxed text-stone-600 dark:text-stone-400">
            {highlightText(event.description, searchQuery)}
          </div>
        )}
      </button>
    </div>
  );
};
