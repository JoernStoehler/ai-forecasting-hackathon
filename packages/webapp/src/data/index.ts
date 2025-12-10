import rawInitialEvents from './initialScenarioEvents.json';
import { coerceScenarioEvents } from '../utils/events';

export const INITIAL_EVENTS = coerceScenarioEvents(rawInitialEvents, 'initial scenario seed');
