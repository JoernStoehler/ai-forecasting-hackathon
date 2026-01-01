import rawInitialEvents from './initialScenarioEvents.json';
import { coerceScenarioEvents } from '@ai-forecasting/engine';

export const INITIAL_EVENTS = coerceScenarioEvents(rawInitialEvents, 'initial scenario seed');

export const SEED_END_DATE = INITIAL_EVENTS.length
  ? INITIAL_EVENTS.reduce<string>((latest, event) => {
      return event.date > latest ? event.date : latest;
    }, INITIAL_EVENTS[0].date)
  : undefined;
