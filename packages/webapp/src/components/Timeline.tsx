import React from 'react';
import { ScenarioEvent } from '../types';
import { EventItem } from './EventItem';

interface TimelineProps {
  events: ScenarioEvent[];
  searchQuery: string;
  seedHistoryEndDate?: string;
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

const ForecastMarker: React.FC<{ date: string }> = ({ date }) => (
  <div className="flex items-center py-3" role="separator" aria-label="Forecast begins">
    <div className="w-12 flex-shrink-0 flex justify-center">
      <div className="h-5 w-5 rounded-full border-2 border-dashed border-amber-400 bg-beige-50" />
    </div>
    <div className="flex-1 border-t border-amber-300/70">
      <span className="ml-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-beige-50 px-2 py-1 rounded">
        Forecast begins
      </span>
      <span className="ml-2 text-xs text-stone-500">Seed history ends {date}</span>
    </div>
  </div>
);

const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleString('en-US', { month: 'short' });
};

export const Timeline: React.FC<TimelineProps> = ({ events, searchQuery, seedHistoryEndDate }) => {
  const visibleEvents = React.useMemo(
    () => events.filter(event => !event.postMortem),
    [events]
  );

  // Create a nested structure for years and months to scope sticky headers.
  // The original `events` array is pre-sorted, so insertion order is chronological.
  const structuredTimeline: Record<string, Record<string, ScenarioEvent[]>> = {};
  visibleEvents.forEach(event => {
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

  const lastEvent = visibleEvents.length > 0 ? visibleEvents[visibleEvents.length - 1] : null;

  let cutoffInserted = false;

  return (
    <div className="relative pt-4">
      {Object.entries(structuredTimeline).map(([year, months]) => (
        <div key={year}>
          <YearMarker year={year} />
          {Object.entries(months).map(([month, monthEvents]) => (
            <div key={month} className="relative">
              <MonthMarker month={month} />
              {monthEvents.flatMap((event, index) => {
                const items: React.ReactNode[] = [];
                if (
                  seedHistoryEndDate &&
                  !cutoffInserted &&
                  event.date > seedHistoryEndDate
                ) {
                  items.push(
                    <ForecastMarker key={`forecast-marker-${seedHistoryEndDate}`} date={seedHistoryEndDate} />
                  );
                  cutoffInserted = true;
                }
                items.push(
                  <EventItem
                    key={`${event.date}-${event.title}-${index}`}
                    event={event}
                    searchQuery={searchQuery}
                    isLast={event === lastEvent}
                  />
                );
                return items;
              })}
            </div>
          ))}
        </div>
      ))}
      {seedHistoryEndDate && !cutoffInserted && (
        <ForecastMarker date={seedHistoryEndDate} />
      )}
    </div>
  );
};
