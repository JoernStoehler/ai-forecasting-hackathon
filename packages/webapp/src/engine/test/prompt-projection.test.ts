/**
 * Tests for prompt projection logic (transform event log into GM-friendly prompt)
 */
import { describe, it, expect } from 'vitest';
import { projectPrompt } from '@/engine/utils/promptProjector.js';
import type { EngineEvent, NewsPublishedEvent, HiddenNewsPublishedEvent, NewsOpenedEvent, TurnStartedEvent, TurnFinishedEvent } from '@/engine/types.js';

describe('Prompt Projection', () => {
  describe('Hidden News Marking', () => {
    it('marks regular news with isHidden: false', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Test Event',
          description: 'Test description',
          id: 'news-123',
        } as NewsPublishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"isHidden":false');
      expect(projection).toContain('"id":"news-123"');
    });

    it('marks hidden news with isHidden: true', () => {
      const events: EngineEvent[] = [
        {
          type: 'hidden-news-published',
          date: '2025-01-15',
          icon: 'ShieldCheck',
          title: 'Secret Development',
          description: 'Classified information',
          id: 'hidden-news-456',
        } as HiddenNewsPublishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"isHidden":true');
      expect(projection).toContain('"id":"hidden-news-456"');
      expect(projection).toContain('Secret Development');
    });

    it('includes both regular and hidden news in timeline', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Public Event',
          description: 'Public information',
          id: 'news-123',
        } as NewsPublishedEvent,
        {
          type: 'hidden-news-published',
          date: '2025-01-20',
          icon: 'ShieldCheck',
          title: 'Hidden Event',
          description: 'Secret information',
          id: 'hidden-news-456',
        } as HiddenNewsPublishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('Public Event');
      expect(projection).toContain('Hidden Event');
      expect(projection).toContain('"isHidden":false');
      expect(projection).toContain('"isHidden":true');
    });

    it('generates consistent IDs for news items without explicit ID', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Test Event',
          description: 'Test',
        } as NewsPublishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"id":"news-2025-01-15-test-event"');
    });

    it('generates consistent IDs for hidden news without explicit ID', () => {
      const events: EngineEvent[] = [
        {
          type: 'hidden-news-published',
          date: '2025-01-15',
          icon: 'ShieldCheck',
          title: 'Secret Event',
          description: 'Secret',
        } as HiddenNewsPublishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"id":"hidden-news-2025-01-15-secret-event"');
    });
  });

  describe('Telemetry Aggregation', () => {
    it('filters out raw news-opened events from timeline', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Test Event',
          description: 'Test',
          id: 'news-123',
        } as NewsPublishedEvent,
        {
          type: 'news-opened',
          targetId: 'news-123',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      // Should have the news event but not the raw telemetry
      expect(projection).toContain('Test Event');
      expect(projection).not.toContain('"type":"news-opened"');
    });

    it('filters out raw news-closed events from timeline', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Test Event',
          description: 'Test',
          id: 'news-123',
        } as NewsPublishedEvent,
        {
          type: 'news-opened',
          targetId: 'news-123',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
        {
          type: 'news-closed',
          targetId: 'news-123',
          at: '2025-01-15T10:05:00Z',
        },
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).not.toContain('"type":"news-opened"');
      expect(projection).not.toContain('"type":"news-closed"');
    });

    it('tracks viewedFirstTime during current turn', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Event 1',
          description: 'Test',
          id: 'news-1',
        } as NewsPublishedEvent,
        {
          type: 'turn-started',
          actor: 'game_master',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-1',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('# PLAYER ATTENTION');
      expect(projection).toContain('"viewedFirstTime":["news-1"]');
    });

    it('tracks notViewed news items', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Event 1',
          description: 'Test',
          id: 'news-1',
        } as NewsPublishedEvent,
        {
          type: 'news-published',
          date: '2025-01-20',
          icon: 'Globe',
          title: 'Event 2',
          description: 'Test',
          id: 'news-2',
        } as NewsPublishedEvent,
        {
          type: 'turn-started',
          actor: 'game_master',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-1',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"notViewed":["news-2"]');
    });

    it('does not include player attention when not in an active turn', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Event 1',
          description: 'Test',
          id: 'news-1',
        } as NewsPublishedEvent,
        {
          type: 'news-opened',
          targetId: 'news-1',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).not.toContain('# PLAYER ATTENTION');
    });

    it('only tracks first-time views during current turn, not re-opens', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Event 1',
          description: 'Test',
          id: 'news-1',
        } as NewsPublishedEvent,
        {
          type: 'turn-started',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-1',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
        {
          type: 'turn-finished',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnFinishedEvent,
        {
          type: 'turn-started',
          actor: 'game_master',
          from: '2025-06-15',
          until: '2025-12-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-1',
          at: '2025-06-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      // Second turn should not show news-1 as viewedFirstTime (already viewed in turn 1)
      const lines = projection.split('\n');
      const attentionLine = lines.find(line => line.includes('viewedFirstTime'));
      expect(attentionLine).toContain('"viewedFirstTime":[]');
    });

    it('clears viewedFirstTime when starting a new turn', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Event 1',
          description: 'Test',
          id: 'news-1',
        } as NewsPublishedEvent,
        {
          type: 'news-published',
          date: '2025-06-15',
          icon: 'Globe',
          title: 'Event 2',
          description: 'Test',
          id: 'news-2',
        } as NewsPublishedEvent,
        {
          type: 'turn-started',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-1',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
        {
          type: 'turn-finished',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnFinishedEvent,
        {
          type: 'turn-started',
          actor: 'game_master',
          from: '2025-06-15',
          until: '2025-12-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-2',
          at: '2025-06-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      // Second turn should only show news-2 as viewedFirstTime
      expect(projection).toContain('"viewedFirstTime":["news-2"]');
    });
  });

  describe('Projection Structure', () => {
    it('includes TIMELINE section', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Test Event',
          description: 'Test',
        } as NewsPublishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('# TIMELINE (JSONL)');
    });

    it('includes CURRENT STATE section', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Test Event',
          description: 'Test',
        } as NewsPublishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('# CURRENT STATE');
      expect(projection).toContain('"latestDate": "2025-01-15"');
    });

    it('includes turn-started and turn-finished events in timeline', () => {
      const events: EngineEvent[] = [
        {
          type: 'turn-started',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnStartedEvent,
        {
          type: 'turn-finished',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnFinishedEvent,
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"type":"turn-started"');
      expect(projection).toContain('"type":"turn-finished"');
    });

    it('includes game-over events in timeline', () => {
      const events: EngineEvent[] = [
        {
          type: 'game-over',
          date: '2025-12-31',
          summary: 'The simulation has ended.',
        },
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"type":"game-over"');
      expect(projection).toContain('The simulation has ended');
    });

    it('includes scenario-head-completed events in timeline', () => {
      const events: EngineEvent[] = [
        {
          type: 'scenario-head-completed',
          date: '2025-01-15',
        },
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"type":"scenario-head-completed"');
    });

    it('includes news-patched events in timeline', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Original Event',
          description: 'Original',
          id: 'news-123',
        } as NewsPublishedEvent,
        {
          type: 'news-patched',
          targetId: 'news-123',
          date: '2025-01-20',
          patch: {
            title: 'Updated Event',
          },
        },
      ];

      const projection = projectPrompt({ history: events });

      expect(projection).toContain('"type":"news-patched"');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty history', () => {
      const projection = projectPrompt({ history: [] });

      expect(projection).toContain('# TIMELINE (JSONL)');
      expect(projection).toContain('# CURRENT STATE');
      expect(projection).toContain('"latestDate": null');
      expect(projection).not.toContain('# PLAYER ATTENTION');
    });

    it('handles multiple turns correctly', () => {
      const events: EngineEvent[] = [
        {
          type: 'news-published',
          date: '2025-01-15',
          icon: 'Globe',
          title: 'Event 1',
          description: 'Test',
          id: 'news-1',
        } as NewsPublishedEvent,
        {
          type: 'turn-started',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-1',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
        {
          type: 'turn-finished',
          actor: 'player',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnFinishedEvent,
        {
          type: 'news-published',
          date: '2025-06-15',
          icon: 'Globe',
          title: 'Event 2',
          description: 'Test',
          id: 'news-2',
        } as NewsPublishedEvent,
        {
          type: 'turn-started',
          actor: 'game_master',
          from: '2025-06-15',
          until: '2025-12-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'news-2',
          at: '2025-06-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      // Should track current turn correctly
      expect(projection).toContain('"from":"2025-06-15"');
      expect(projection).toContain('"until":"2025-12-15"');
      expect(projection).toContain('"viewedFirstTime":["news-2"]');
    });

    it('handles viewing hidden news items', () => {
      const events: EngineEvent[] = [
        {
          type: 'hidden-news-published',
          date: '2025-01-15',
          icon: 'ShieldCheck',
          title: 'Secret Event',
          description: 'Secret',
          id: 'hidden-news-1',
        } as HiddenNewsPublishedEvent,
        {
          type: 'turn-started',
          actor: 'game_master',
          from: '2025-01-15',
          until: '2025-06-15',
        } as TurnStartedEvent,
        {
          type: 'news-opened',
          targetId: 'hidden-news-1',
          at: '2025-01-15T10:00:00Z',
        } as NewsOpenedEvent,
      ];

      const projection = projectPrompt({ history: events });

      // Hidden news should be marked as hidden in timeline
      expect(projection).toContain('"isHidden":true');
      // But tracking should work normally (GM can see these)
      expect(projection).toContain('"viewedFirstTime":["hidden-news-1"]');
    });
  });
});
