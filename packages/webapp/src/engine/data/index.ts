import rawInitialEvents from './initialScenarioEvents.json' with { type: 'json' };
import { coerceEngineEvents } from '../utils/events.js';

export const INITIAL_EVENTS = coerceEngineEvents(rawInitialEvents, 'initial scenario seed');
