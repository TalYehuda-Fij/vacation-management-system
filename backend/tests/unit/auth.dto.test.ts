import { describe, it, expect } from 'vitest';
import { loginSchema } from '../../src/dto/auth.dto.js';

describe('loginSchema', () => {
  it('accepts a valid email + password', () => {
    const result = loginSchema.safeParse({ email: 'alice@example.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'alice@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({ password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'alice@example.com' });
    expect(result.success).toBe(false);
  });
});
