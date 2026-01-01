import React, { useState } from 'react';
import type { NewsPublishedEvent } from '../types';
import { Icon } from './icons';

interface EventItemProps {
  event: NewsPublishedEvent;
  searchQuery?: string;
  isLast: boolean;
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
          <mark key={i} className="bg-amber-200 text-stone-800 px-0.5 rounded-sm">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};


export const EventItem: React.FC<EventItemProps> = ({ event, searchQuery = '', isLast }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex items-start">
      {/* Icon Gutter */}
      <div className="w-12 flex-shrink-0 flex justify-center pt-1">
        <div className="p-1 rounded-full bg-beige-50">
          <Icon name={event.icon} className="w-5 h-5 text-stone-600" />
        </div>
      </div>
      
      {/* Event Content */}
      <div 
        className={`flex-grow cursor-pointer ${isLast ? 'pb-4' : 'pb-6'}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 pt-1">
          <h3 className="font-medium leading-tight text-stone-800">
            {highlightText(event.title, searchQuery)}
          </h3>
        </div>
        {isExpanded && (
          <div className="mt-2 leading-relaxed text-stone-600">
            {highlightText(event.description, searchQuery)}
          </div>
        )}
      </div>
    </div>
  );
};
