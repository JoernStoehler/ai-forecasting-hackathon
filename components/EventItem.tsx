import React, { useState } from 'react';
import { Event } from '../types';
import { Icon } from './icons';

interface EventItemProps {
  event: Event;
  searchQuery?: string;
  isLast: boolean;
}

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
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
        <div className="bg-beige-50 p-1 rounded-full">
          <Icon name={event.icon} className="w-5 h-5 text-stone-600" />
        </div>
      </div>
      
      {/* Event Content */}
      <div 
        className={`flex-grow cursor-pointer ${isLast ? 'pb-4' : 'pb-6'}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h3 className="text-stone-800 font-medium leading-tight pt-1">
          {highlightText(event.title, searchQuery)}
        </h3>
        {isExpanded && (
          <div className="mt-2 text-stone-600 leading-relaxed">
            {highlightText(event.description, searchQuery)}
          </div>
        )}
      </div>
    </div>
  );
};