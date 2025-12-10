import rawInitialEvents from './initialScenarioEvents.json' assert { type: 'json' };
import { coerceScenarioEvents } from '../utils/events.js';

export const INITIAL_EVENTS = coerceScenarioEvents(rawInitialEvents, 'initial scenario seed');
