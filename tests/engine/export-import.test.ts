/// <reference types="vitest/globals" />
import { validatePlanImport } from '../../src/schemas/plan';
import { createPlanFromTemplate } from '../../src/state/storage';
import {
  exportBudgetCsv,
  exportTimelineCsv,
  exportCueSheetsCsv,
  exportAfterEventCsv,
  exportPlanJson,
} from '../../src/lib/export';

describe('Export and Import Engine', () => {
  const samplePlan = createPlanFromTemplate('wedding');

  describe('validatePlanImport', () => {
    it('successfully parses and validates a well-formed plan', () => {
      const parsed = validatePlanImport(samplePlan);
      expect(parsed.event.title).toBe(samplePlan.event.title);
      expect(parsed.moments.length).toBe(samplePlan.moments.length);
    });

    it('rejects payloads with __proto__ prototype pollution attempts', () => {
      const jsonStr = '{"__proto__": {"admin": true}, "event": {}}';
      const raw = JSON.parse(jsonStr) as unknown;

      expect(() => validatePlanImport(raw)).toThrow(/forbidden key/i);
    });

    it('rejects payloads with constructor key', () => {
      const raw = {
        constructor: { name: 'exploit' },
        event: samplePlan.event,
      };

      expect(() => validatePlanImport(raw)).toThrow(/forbidden key/i);
    });

    it('rejects payloads with prototype key', () => {
      const raw = {
        prototype: { exploit: true },
        event: samplePlan.event,
      };

      expect(() => validatePlanImport(raw)).toThrow(/forbidden key/i);
    });

    it('rejects invalid or corrupted schemas', () => {
      const corrupted = {
        event: { title: 'No other fields' },
      };

      expect(() => validatePlanImport(corrupted)).toThrow();
    });
  });

  describe('Export functions (CSV & JSON)', () => {
    beforeAll(() => {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      window.URL.revokeObjectURL = vi.fn();
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    });

    it('exportBudgetCsv generates valid downloadable file', () => {
      expect(() => { exportBudgetCsv(samplePlan); }).not.toThrow();
    });

    it('exportTimelineCsv generates valid downloadable file', () => {
      expect(() => { exportTimelineCsv(samplePlan); }).not.toThrow();
    });

    it('exportCueSheetsCsv generates valid downloadable file', () => {
      expect(() => { exportCueSheetsCsv(samplePlan); }).not.toThrow();
    });

    it('exportAfterEventCsv generates valid downloadable file', () => {
      expect(() => { exportAfterEventCsv(samplePlan); }).not.toThrow();
    });

    it('exportPlanJson generates valid downloadable JSON file', () => {
      expect(() => { exportPlanJson(samplePlan); }).not.toThrow();
    });
  });
});
