import rawInitialEvents from './initialScenarioEvents.json';
import { coerceEngineEvents } from '@ai-forecasting/engine';

export const INITIAL_EVENTS = coerceEngineEvents(rawInitialEvents, 'initial scenario seed');
