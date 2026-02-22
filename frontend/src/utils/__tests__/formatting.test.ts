import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    formatXLM,
    formatNumber,
    truncateAddress,
    formatDate,
    formatRelativeTime,
    stroopsToXLM,
    xlmToStroops,
    formatFileSize,
    getErrorMessage,
} from '../formatting';

describe('formatting utilities', () => {
    describe('formatXLM', () => {
        it('should format positive XLM amounts with proper decimals', () => {
            expect(formatXLM(10)).toBe('10.00');
            expect(formatXLM(10.123456789)).toBe('10.1234568');
            expect(formatXLM('5.5')).toBe('5.50');
        });

        it('should handle zero', () => {
            expect(formatXLM(0)).toBe('0.00');
            expect(formatXLM('0')).toBe('0.00');
        });

        it('should handle negative numbers', () => {
            expect(formatXLM(-10)).toBe('-10.00');
            expect(formatXLM('-5.5')).toBe('-5.50');
        });

        it('should handle very large numbers', () => {
            expect(formatXLM(1_000_000_000)).toBe('1,000,000,000.00');
            expect(formatXLM('999999999.9999999')).toBe('999,999,999.9999999');
        });

        it('should handle very small numbers', () => {
            expect(formatXLM(0.0000001)).toBe('0.0000001');
            expect(formatXLM(0.00000001)).toBe('0.00');
        });

        it('should accept both string and number types', () => {
            expect(formatXLM(100)).toBe('100.00');
            expect(formatXLM('100')).toBe('100.00');
        });
    });

    describe('formatNumber', () => {
        it('should format numbers with thousand separators', () => {
            expect(formatNumber(1000)).toBe('1,000');
            expect(formatNumber(1000000)).toBe('1,000,000');
            expect(formatNumber('5000')).toBe('5,000');
        });

        it('should handle zero', () => {
            expect(formatNumber(0)).toBe('0');
            expect(formatNumber('0')).toBe('0');
        });

        it('should handle negative numbers', () => {
            expect(formatNumber(-1000)).toBe('-1,000');
            expect(formatNumber('-5000')).toBe('-5,000');
        });

        it('should handle very large numbers', () => {
            expect(formatNumber(1_000_000_000_000)).toBe('1,000,000,000,000');
            expect(formatNumber('999999999999')).toBe('999,999,999,999');
        });

        it('should handle decimal numbers', () => {
            expect(formatNumber(1234.56)).toBe('1,234.56');
            expect(formatNumber('9876.543')).toBe('9,876.543');
        });

        it('should accept both string and number types', () => {
            expect(formatNumber(5000)).toBe('5,000');
            expect(formatNumber('5000')).toBe('5,000');
        });
    });

    describe('truncateAddress', () => {
        it('should truncate long addresses with default parameters', () => {
            const address = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
            expect(truncateAddress(address)).toBe('GXXXXX...XXXX');
        });

        it('should truncate with custom start and end characters', () => {
            const address = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
            expect(truncateAddress(address, 4, 4)).toBe('GXXX...XXXX');
            expect(truncateAddress(address, 8, 6)).toBe('GXXXXXXX...XXXXXX');
            expect(truncateAddress(address, 10, 2)).toBe('GXXXXXXXXX...XX');
        });

        it('should not truncate short addresses', () => {
            expect(truncateAddress('GXXXXX')).toBe('GXXXXX');
            expect(truncateAddress('GXXXXXXXXX', 6, 4)).toBe('GXXXXXXXXX');
        });

        it('should handle edge case where address length equals startChars + endChars', () => {
            expect(truncateAddress('GXXXXXXXXX', 6, 4)).toBe('GXXXXXXXXX');
        });

        it('should handle empty string', () => {
            expect(truncateAddress('')).toBe('');
        });

        it('should handle single character', () => {
            expect(truncateAddress('G')).toBe('G');
        });
    });

    describe('formatDate', () => {
        it('should format timestamps to readable dates', () => {
            const timestamp = new Date('2024-01-15T10:30:00').getTime();
            const formatted = formatDate(timestamp);
            expect(formatted).toContain('Jan');
            expect(formatted).toContain('15');
            expect(formatted).toContain('2024');
            expect(formatted).toContain('10:30');
        });

        it('should handle zero timestamp (epoch)', () => {
            const formatted = formatDate(0);
            expect(formatted).toContain('1970');
        });

        it('should handle current timestamp', () => {
            const now = Date.now();
            const formatted = formatDate(now);
            expect(formatted).toContain('2026');
        });

        it('should format different months correctly', () => {
            const march = new Date('2024-03-20T15:45:00').getTime();
            const december = new Date('2024-12-31T23:59:00').getTime();
            expect(formatDate(march)).toContain('Mar');
            expect(formatDate(december)).toContain('Dec');
        });

        it('should include time in 24-hour format', () => {
            const morning = new Date('2024-01-15T09:05:00').getTime();
            const evening = new Date('2024-01-15T21:30:00').getTime();
            expect(formatDate(morning)).toContain('09:05');
            expect(formatDate(evening)).toContain('09:30');
        });
    });

    describe('formatRelativeTime', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return "Just now" for recent timestamps', () => {
            const now = Date.now();
            vi.setSystemTime(now);
            expect(formatRelativeTime(now)).toBe('Just now');
            expect(formatRelativeTime(now - 30_000)).toBe('Just now');
        });

        it('should format minutes ago', () => {
            const now = Date.now();
            vi.setSystemTime(now);
            expect(formatRelativeTime(now - 60_000)).toBe('1 minute ago');
            expect(formatRelativeTime(now - 120_000)).toBe('2 minutes ago');
            expect(formatRelativeTime(now - 45 * 60_000)).toBe('45 minutes ago');
        });

        it('should format hours ago', () => {
            const now = Date.now();
            vi.setSystemTime(now);
            expect(formatRelativeTime(now - 60 * 60_000)).toBe('1 hour ago');
            expect(formatRelativeTime(now - 2 * 60 * 60_000)).toBe('2 hours ago');
            expect(formatRelativeTime(now - 23 * 60 * 60_000)).toBe('23 hours ago');
        });

        it('should format days ago', () => {
            const now = Date.now();
            vi.setSystemTime(now);
            expect(formatRelativeTime(now - 24 * 60 * 60_000)).toBe('1 day ago');
            expect(formatRelativeTime(now - 2 * 24 * 60 * 60_000)).toBe('2 days ago');
            expect(formatRelativeTime(now - 30 * 24 * 60 * 60_000)).toBe('30 days ago');
        });

        it('should handle edge cases at boundaries', () => {
            const now = Date.now();
            vi.setSystemTime(now);
            expect(formatRelativeTime(now - 59_000)).toBe('Just now');
            expect(formatRelativeTime(now - 61_000)).toBe('1 minute ago');
            expect(formatRelativeTime(now - 59 * 60_000)).toBe('59 minutes ago');
            expect(formatRelativeTime(now - 61 * 60_000)).toBe('1 hour ago');
        });

        it('should use correct singular/plural forms', () => {
            const now = Date.now();
            vi.setSystemTime(now);
            expect(formatRelativeTime(now - 60_000)).toBe('1 minute ago');
            expect(formatRelativeTime(now - 120_000)).toBe('2 minutes ago');
            expect(formatRelativeTime(now - 60 * 60_000)).toBe('1 hour ago');
            expect(formatRelativeTime(now - 2 * 60 * 60_000)).toBe('2 hours ago');
            expect(formatRelativeTime(now - 24 * 60 * 60_000)).toBe('1 day ago');
            expect(formatRelativeTime(now - 2 * 24 * 60 * 60_000)).toBe('2 days ago');
        });
    });

    describe('stroopsToXLM', () => {
        it('should convert stroops to XLM correctly', () => {
            expect(stroopsToXLM(10_000_000)).toBe(1);
            expect(stroopsToXLM(70_000_000)).toBe(7);
            expect(stroopsToXLM('50000000')).toBe(5);
        });

        it('should handle zero', () => {
            expect(stroopsToXLM(0)).toBe(0);
            expect(stroopsToXLM('0')).toBe(0);
        });

        it('should handle negative stroops', () => {
            expect(stroopsToXLM(-10_000_000)).toBe(-1);
            expect(stroopsToXLM('-50000000')).toBe(-5);
        });

        it('should handle very large stroops', () => {
            expect(stroopsToXLM(1_000_000_000_000_000)).toBe(100_000_000);
            expect(stroopsToXLM('100000000000000')).toBe(10_000_000);
        });

        it('should handle fractional XLM results', () => {
            expect(stroopsToXLM(1)).toBe(0.0000001);
            expect(stroopsToXLM(5_000_000)).toBe(0.5);
            expect(stroopsToXLM(12_345_678)).toBe(1.2345678);
        });

        it('should accept both string and number types', () => {
            expect(stroopsToXLM(10_000_000)).toBe(1);
            expect(stroopsToXLM('10000000')).toBe(1);
        });
    });

    describe('xlmToStroops', () => {
        it('should convert XLM to stroops correctly', () => {
            expect(xlmToStroops(1)).toBe(10_000_000);
            expect(xlmToStroops(7)).toBe(70_000_000);
            expect(xlmToStroops('5')).toBe(50_000_000);
        });

        it('should handle zero', () => {
            expect(xlmToStroops(0)).toBe(0);
            expect(xlmToStroops('0')).toBe(0);
        });

        it('should handle negative XLM', () => {
            expect(xlmToStroops(-1)).toBe(-10_000_000);
            expect(xlmToStroops('-5')).toBe(-50_000_000);
        });

        it('should handle very large XLM amounts', () => {
            expect(xlmToStroops(100_000_000)).toBe(1_000_000_000_000_000);
            expect(xlmToStroops('999999999')).toBe(9_999_999_990_000_000);
        });

        it('should handle fractional XLM and floor the result', () => {
            expect(xlmToStroops(0.5)).toBe(5_000_000);
            expect(xlmToStroops(1.2345678)).toBe(12_345_678);
            expect(xlmToStroops(1.23456789)).toBe(12_345_678);
        });

        it('should floor fractional stroops', () => {
            expect(xlmToStroops(0.00000015)).toBe(1);
            expect(xlmToStroops(0.99999999)).toBe(9_999_999);
        });

        it('should accept both string and number types', () => {
            expect(xlmToStroops(1)).toBe(10_000_000);
            expect(xlmToStroops('1')).toBe(10_000_000);
        });
    });

    describe('formatFileSize', () => {
        it('should format bytes correctly', () => {
            expect(formatFileSize(0)).toBe('0 B');
            expect(formatFileSize(500)).toBe('500 B');
            expect(formatFileSize(1023)).toBe('1023 B');
        });

        it('should format kilobytes correctly', () => {
            expect(formatFileSize(1024)).toBe('1.00 KB');
            expect(formatFileSize(1536)).toBe('1.50 KB');
            expect(formatFileSize(10240)).toBe('10.00 KB');
            expect(formatFileSize(1024 * 1023)).toBe('1023.00 KB');
        });

        it('should format megabytes correctly', () => {
            expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
            expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
            expect(formatFileSize(10 * 1024 * 1024)).toBe('10.00 MB');
            expect(formatFileSize(1024 * 1024 * 1024)).toBe('1024.00 MB');
        });

        it('should handle edge cases at boundaries', () => {
            expect(formatFileSize(1023)).toBe('1023 B');
            expect(formatFileSize(1024)).toBe('1.00 KB');
            expect(formatFileSize(1024 * 1024 - 1)).toBe('1024.00 KB');
            expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
        });

        it('should format with two decimal places', () => {
            expect(formatFileSize(1234)).toBe('1.21 KB');
            expect(formatFileSize(1234567)).toBe('1.18 MB');
        });

        it('should handle very large files', () => {
            expect(formatFileSize(1024 * 1024 * 1024 * 10)).toBe('10240.00 MB');
        });
    });

    describe('getErrorMessage', () => {
        it('should extract message from Error objects', () => {
            const error = new Error('Test error message');
            expect(getErrorMessage(error)).toBe('Test error message');
        });

        it('should return string errors directly', () => {
            expect(getErrorMessage('String error')).toBe('String error');
        });

        it('should handle unknown error types', () => {
            expect(getErrorMessage(null)).toBe('An unknown error occurred');
            expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
            expect(getErrorMessage(123)).toBe('An unknown error occurred');
            expect(getErrorMessage({})).toBe('An unknown error occurred');
            expect(getErrorMessage([])).toBe('An unknown error occurred');
        });

        it('should handle custom Error subclasses', () => {
            class CustomError extends Error {
                constructor(message: string) {
                    super(message);
                    this.name = 'CustomError';
                }
            }
            const error = new CustomError('Custom error message');
            expect(getErrorMessage(error)).toBe('Custom error message');
        });
    });
});
