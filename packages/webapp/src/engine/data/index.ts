import { INITIAL_SCENARIO_EVENTS } from './initialScenarioEvents.js';
import { coerceEngineEvents } from '../utils/events.js';

export const INITIAL_EVENTS = coerceEngineEvents(INITIAL_SCENARIO_EVENTS, 'initial scenario seed');
