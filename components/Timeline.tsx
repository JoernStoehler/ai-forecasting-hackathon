import React from 'react';
import { Event } from '../types';
import { EventItem } from './EventItem';

interface TimelineProps {
  events: Event[];
  searchQuery: string;
}

const YearMarker: React.FC<{ year: string }> = ({ year }) => (
    <div className="sticky top-16 bg-beige-50 z-10 py-2 flex">
      <div className="w-12 flex-shrink-0 flex justify-center">
        <h2 className="text-2xl font-bold text-amber-800 tracking-tight">{year}</h2>
      </div>
    </div>
);

const MonthMarker: React.FC<{ month: string }> = ({ month }) => (
    <div className="sticky top-24 bg-beige-50 z-10 pt-4 pb-2 flex">
      <div className="w-12 flex-shrink-0 flex justify-center">
        <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wider">{month}</h3>
      </div>
    </div>
);

const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleString('en-US', { month: 'short' });
};

export const Timeline: React.FC<TimelineProps> = ({ events, searchQuery }) => {
  // Create a nested structure for years and months to scope sticky headers.
  // The original `events` array is pre-sorted, so insertion order is chronological.
  const structuredTimeline: Record<string, Record<string, Event[]>> = {};
  events.forEach(event => {
    const year = event.date.substring(0, 4);
    const month = getMonthName(event.date);
    if (!structuredTimeline[year]) {
      structuredTimeline[year] = {};
    }
    if (!structuredTimeline[year][month]) {
      structuredTimeline[year][month] = [];
    }
    structuredTimeline[year][month].push(event);
  });

  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  return (
    <div className="relative pt-4">
      {Object.entries(structuredTimeline).map(([year, months]) => (
        <div key={year}>
          <YearMarker year={year} />
          {Object.entries(months).map(([month, monthEvents]) => (
            <div key={month} className="relative">
              <MonthMarker month={month} />
              {monthEvents.map((event, index) => (
                <EventItem
                  key={`${event.date}-${event.title}-${index}`}
                  event={event}
                  searchQuery={searchQuery}
                  isLast={event === lastEvent}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};