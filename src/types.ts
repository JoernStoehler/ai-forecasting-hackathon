import type { IconName } from './constants';

export interface ScenarioEvent {
  date: string; // YYYY-MM-DD
  icon: IconName; // Lucide icon name
  title: string;
  description: string;
  postMortem?: boolean; // hidden until the scenario enters post-mortem mode
}
