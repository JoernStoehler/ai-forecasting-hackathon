import React, { useState } from 'react';
import { normalizePublishHiddenNews, normalizePublishNews } from '@ai-forecasting/engine';
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


export const EventItem: React.FC<EventItemProps> = ({ event, searchQuery = '', isLast, onTelemetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const resolveTargetId = () => {
    if (event.id) return event.id;
    if (event.type === 'hidden-news-published') {
      return normalizePublishHiddenNews({
        type: 'publish-hidden-news',
        date: event.date,
        icon: event.icon,
        title: event.title,
        description: event.description,
      }).id;
    }
    return normalizePublishNews({
      type: 'publish-news',
      date: event.date,
      icon: event.icon,
      title: event.title,
      description: event.description,
    }).id;
  };

  const handleToggle = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    if (!event || !('date' in event)) return;
    const targetId = resolveTargetId();
    if (!targetId) return;
    if (typeof targetId !== 'string') return;
    if (!onTelemetry) return;
    onTelemetry(nextExpanded ? 'news-opened' : 'news-closed', targetId);
  };

  return (
    <div className="flex items-start">
      {/* Icon Gutter */}
      <div className="w-12 flex-shrink-0 flex justify-center pt-1">
        <div className="p-1 rounded-full bg-beige-50">
          <Icon
            name={event.icon}
            className="w-5 h-5 text-stone-600"
          />
        </div>
      </div>
      
      {/* Event Content */}
      <div 
        className={`flex-grow cursor-pointer ${isLast ? 'pb-4' : 'pb-6'}`}
        onClick={handleToggle}
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
