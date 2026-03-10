import { describe, it, expect } from 'vitest';
import { calculateFinalScore, classifyScore, aggregateScores, getScoreDistribution } from '../lib/scoring/final';

describe('Scoring Logic Tests', () => {

    describe('calculateFinalScore', () => {
        it('should correctly calculate the final score with appropriate weights', () => {
            // formula: 0.3 * util + 0.35 * outcome + 0.35 * output
            const util = 80;
            const outcome = 70;
            const output = 90;
            const expected = 0.3 * 80 + 0.35 * 70 + 0.35 * 90; // 24 + 24.5 + 31.5 = 80
            const result = calculateFinalScore(util, output, outcome);
            expect(result).toBe(expected);
        });

        it('should round to two decimal places', () => {
            const result = calculateFinalScore(80.55, 70.33, 90.11);
            // 0.3*80.55 + 0.35*70.33 + 0.35*90.11 = 24.165 + 24.6155 + 31.5385 = 80.319 -> 80.32
            expect(result).toBe(80.32);
        });
    });

    describe('classifyScore', () => {
        it('should return EXCELLENT for >= 85', () => {
            expect(classifyScore(85)).toBe('EXCELLENT');
            expect(classifyScore(100)).toBe('EXCELLENT');
        });

        it('should return GOOD for >= 70 and < 85', () => {
            expect(classifyScore(70)).toBe('GOOD');
            expect(classifyScore(84.9)).toBe('GOOD');
        });

        it('should return AVERAGE for >= 55 and < 70', () => {
            expect(classifyScore(55)).toBe('AVERAGE');
            expect(classifyScore(69.9)).toBe('AVERAGE');
        });

        it('should return POOR for >= 40 and < 55', () => {
            expect(classifyScore(40)).toBe('POOR');
            expect(classifyScore(54.9)).toBe('POOR');
        });

        it('should return CRITICAL for < 40', () => {
            expect(classifyScore(39.9)).toBe('CRITICAL');
            expect(classifyScore(0)).toBe('CRITICAL');
        });
    });

    describe('aggregateScores', () => {
        it('should calculate weighted average correctly', () => {
            const schemes = [
                { finalScore: 80, allocated: 100 }, // 8000
                { finalScore: 60, allocated: 50 },  // 3000
            ];
            // Total Allocated = 150
            // Weighted Sum = 11000
            // Aggregate = 11000 / 150 = 73.333... -> 73.33
            expect(aggregateScores(schemes as any)).toBe(73.33);
        });

        it('should return 0 when total allocated is 0', () => {
            const schemes = [
                { finalScore: 80, allocated: 0 }
            ];
            expect(aggregateScores(schemes as any)).toBe(0);
        });
    });
});
