import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../../src/middleware/errorHandler.js';

function mockResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('AppError', () => {
  it('exposes statusCode, code, message, and optional details', () => {
    const err = new AppError(409, 'DATE_OVERLAP', 'overlap', { field: 'start_date' });
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('DATE_OVERLAP');
    expect(err.message).toBe('overlap');
    expect(err.details).toEqual({ field: 'start_date' });
  });

  it('details is optional', () => {
    const err = new AppError(404, 'NOT_FOUND', 'missing');
    expect(err.details).toBeUndefined();
  });

  it('is an instance of Error', () => {
    const err = new AppError(400, 'BAD', 'bad');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('errorHandler middleware', () => {
  it('formats AppError into the standard error shape with correct status', () => {
    const err = new AppError(403, 'FORBIDDEN', 'no access');
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'FORBIDDEN', message: 'no access', details: undefined },
    });
  });

  it('includes details in the response when present', () => {
    const err = new AppError(400, 'VALIDATION_ERROR', 'invalid', { field: 'email' });
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'invalid', details: { field: 'email' } },
    });
  });

  it('falls back to 500 INTERNAL_ERROR for unknown errors', () => {
    const err = new Error('unexpected boom');
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });

  it('treats non-Error throws as internal errors', () => {
    const req = {} as Request;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    errorHandler('a string error', req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
