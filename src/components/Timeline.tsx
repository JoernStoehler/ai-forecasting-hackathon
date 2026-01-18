import React from 'react';
import type { ScenarioEvent, TurnStartedEvent, TurnFinishedEvent } from '../types';
import { EventItem } from './EventItem';

type TimelineEvent = ScenarioEvent | TurnStartedEvent | TurnFinishedEvent;

interface TimelineProps {
  events: TimelineEvent[];
  searchQuery: string;
  boundaryDate?: string;
  onTelemetry?: (type: 'news-opened' | 'news-closed', targetId: string) => void;
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
  <div className="flex items-center py-3" role="separator" aria-label="Scenario body begins">
    <div className="w-12 flex-shrink-0 flex justify-center">
      <div className="h-5 w-5 rounded-full border-2 border-dashed border-amber-400 bg-beige-50" />
    </div>
    <div className="flex-1 border-t border-amber-300/70">
      <span className="ml-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-beige-50 px-2 py-1 rounded">
        Scenario body begins
      </span>
      <span className="ml-2 text-xs text-stone-500">Scenario head ends {date}</span>
    </div>
  </div>
);

const TurnMarker: React.FC<{ actor: 'player' | 'game_master'; from: string; until: string; type: 'turn-started' | 'turn-finished' }> = ({ actor, from, until, type }) => {
  const isPlayer = actor === 'player';
  const isStarted = type === 'turn-started';
  const label = isStarted
    ? `${isPlayer ? 'Player' : 'GM'} turn begins`
    : `${isPlayer ? 'Player' : 'GM'} turn ends`;

  return (
    <div className="flex items-center py-2" role="separator" aria-label={label}>
      <div className="w-12 flex-shrink-0 flex justify-center">
        <div className={`h-4 w-4 rounded-full border-2 ${isPlayer ? 'border-blue-500 bg-blue-100' : 'border-amber-500 bg-amber-100'}`} />
      </div>
      <div className="flex-1 border-t border-stone-300">
        <span className={`ml-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${isPlayer ? 'text-blue-700' : 'text-amber-700'} bg-beige-50 px-2 py-1 rounded`}>
          {isPlayer ? '👤' : '🎲'} {isPlayer ? 'Player' : 'GM'} {isStarted ? '▸' : '▪'}
        </span>
        <span className="ml-2 text-xs text-stone-500">{from} → {until}</span>
      </div>
    </div>
  );
};

const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleString('en-US', { month: 'short' });
};

export const Timeline: React.FC<TimelineProps> = ({ events, searchQuery, boundaryDate, onTelemetry }) => {
  // Create a nested structure for years and months to scope sticky headers.
  // The original `events` array is pre-sorted, so insertion order is chronological.
  const structuredTimeline: Record<string, Record<string, TimelineEvent[]>> = {};
  events.forEach(event => {
    // For turn markers, use the 'from' date for positioning
    const dateStr = 'date' in event ? event.date : event.from;
    const year = dateStr.substring(0, 4);
    const month = getMonthName(dateStr);
    if (!structuredTimeline[year]) {
      structuredTimeline[year] = {};
    }
    if (!structuredTimeline[year][month]) {
      structuredTimeline[year][month] = [];
    }
    structuredTimeline[year][month].push(event);
  });

  const lastNewsEvent = events.find((e): e is ScenarioEvent => 'date' in e && (e.type === 'news-published' || e.type === 'hidden-news-published')) ?? null;

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
                const eventDate = 'date' in event ? event.date : event.from;

                // Insert forecast marker if needed
                if (
                  boundaryDate &&
                  !cutoffInserted &&
                  eventDate > boundaryDate
                ) {
                  items.push(
                    <ForecastMarker key={`forecast-marker-${boundaryDate}`} date={boundaryDate} />
                  );
                  cutoffInserted = true;
                }

                // Render the event based on its type
                if (event.type === 'turn-started' || event.type === 'turn-finished') {
                  items.push(
                    <TurnMarker
                      key={`${event.type}-${event.actor}-${event.from}-${index}`}
                      actor={event.actor}
                      from={event.from}
                      until={event.until}
                      type={event.type}
                    />
                  );
                } else {
                  // ScenarioEvent (news-published or hidden-news-published)
                  items.push(
                    <EventItem
                      key={`${event.date}-${event.title}-${index}`}
                      event={event}
                      searchQuery={searchQuery}
                      isLast={event === lastNewsEvent}
                      onTelemetry={onTelemetry}
                    />
                  );
                }
                return items;
              })}
            </div>
          ))}
        </div>
      ))}
      {boundaryDate && !cutoffInserted && (
        <ForecastMarker date={boundaryDate} />
      )}
    </div>
  );
};
