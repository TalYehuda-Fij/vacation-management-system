import { describe, it, expect } from 'vitest';
import {
  createRequestSchema,
  listQuerySchema,
  approveSchema,
  rejectSchema,
} from '../../src/dto/vacationRequest.dto.js';

describe('createRequestSchema', () => {
  it('accepts a valid request without reason', () => {
    const result = createRequestSchema.safeParse({
      start_date: '2026-06-01',
      end_date: '2026-06-05',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid request with reason', () => {
    const result = createRequestSchema.safeParse({
      start_date: '2026-06-01',
      end_date: '2026-06-05',
      reason: 'Family trip',
    });
    expect(result.success).toBe(true);
  });

  it('accepts single-day request (start === end)', () => {
    const result = createRequestSchema.safeParse({
      start_date: '2026-06-01',
      end_date: '2026-06-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects end_date before start_date', () => {
    const result = createRequestSchema.safeParse({
      start_date: '2026-06-10',
      end_date: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects wrong date format', () => {
    const result = createRequestSchema.safeParse({
      start_date: '06/01/2026',
      end_date: '06/05/2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing start_date', () => {
    const result = createRequestSchema.safeParse({ end_date: '2026-06-05' });
    expect(result.success).toBe(false);
  });

  it('rejects missing end_date', () => {
    const result = createRequestSchema.safeParse({ start_date: '2026-06-01' });
    expect(result.success).toBe(false);
  });
});

describe('listQuerySchema', () => {
  it('applies default values for empty query', () => {
    const result = listQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
      expect(result.data.sort).toBe('desc');
      expect(result.data.status).toBeUndefined();
    }
  });

  it('coerces string numbers to integers', () => {
    const result = listQuerySchema.safeParse({ page: '3', pageSize: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(50);
    }
  });

  it('accepts valid status values', () => {
    for (const status of ['pending', 'approved', 'rejected'] as const) {
      const result = listQuerySchema.safeParse({ status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = listQuerySchema.safeParse({ status: 'archived' });
    expect(result.success).toBe(false);
  });

  it('rejects pageSize over 100', () => {
    const result = listQuerySchema.safeParse({ pageSize: '500' });
    expect(result.success).toBe(false);
  });

  it('rejects negative page numbers', () => {
    const result = listQuerySchema.safeParse({ page: '-1' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sort direction', () => {
    const result = listQuerySchema.safeParse({ sort: 'random' });
    expect(result.success).toBe(false);
  });
});

describe('approveSchema', () => {
  it('accepts empty body', () => {
    const result = approveSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts a comment', () => {
    const result = approveSchema.safeParse({ comments: 'Looks good' });
    expect(result.success).toBe(true);
  });
});

describe('rejectSchema', () => {
  it('accepts a valid comment', () => {
    const result = rejectSchema.safeParse({ comments: 'Too many people off' });
    expect(result.success).toBe(true);
  });

  it('rejects missing comments', () => {
    const result = rejectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty string comment', () => {
    const result = rejectSchema.safeParse({ comments: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only comment', () => {
    const result = rejectSchema.safeParse({ comments: '   ' });
    expect(result.success).toBe(false);
  });

  it('trims the comment string', () => {
    const result = rejectSchema.safeParse({ comments: '  valid reason  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comments).toBe('valid reason');
    }
  });
});
