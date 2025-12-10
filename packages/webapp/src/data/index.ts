import rawInitialEvents from './initialScenarioEvents.json';
import { coerceScenarioEvents } from '@ai-forecasting/engine';

export const INITIAL_EVENTS = coerceScenarioEvents(rawInitialEvents, 'initial scenario seed');
