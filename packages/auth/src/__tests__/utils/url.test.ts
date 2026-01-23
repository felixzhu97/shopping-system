import { describe, it, expect } from 'vitest';
import {
  parseQueryParams,
  extractCodeFromUrl,
  extractStateFromUrl,
  extractErrorFromUrl,
  buildQueryString,
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
  isValidCallbackUrl,
} from '../../utils/url';

describe('parseQueryParams', () => {
  it('should parse query parameters from URL string', () => {
    // Given
    const url = 'https://example.com/callback?code=abc123&state=xyz789';

    // When
    const params = parseQueryParams(url);

    // Then
    expect(params.code).toBe('abc123');
    expect(params.state).toBe('xyz789');
  });

  it('should parse query parameters from URL object', () => {
    // Given
    const url = new URL('https://example.com/callback?code=abc123&state=xyz789');

    // When
    const params = parseQueryParams(url);

    // Then
    expect(params.code).toBe('abc123');
    expect(params.state).toBe('xyz789');
  });

  it('should return empty object when no query parameters', () => {
    // Given
    const url = 'https://example.com/callback';

    // When
    const params = parseQueryParams(url);

    // Then
    expect(params).toEqual({});
  });
});

describe('extractCodeFromUrl', () => {
  it('should extract code from URL', () => {
    // Given
    const url = 'https://example.com/callback?code=abc123';

    // When
    const code = extractCodeFromUrl(url);

    // Then
    expect(code).toBe('abc123');
  });

  it('should return null when code not present', () => {
    // Given
    const url = 'https://example.com/callback';

    // When
    const code = extractCodeFromUrl(url);

    // Then
    expect(code).toBeNull();
  });
});

describe('extractStateFromUrl', () => {
  it('should extract state from URL', () => {
    // Given
    const url = 'https://example.com/callback?state=xyz789';

    // When
    const state = extractStateFromUrl(url);

    // Then
    expect(state).toBe('xyz789');
  });

  it('should return null when state not present', () => {
    // Given
    const url = 'https://example.com/callback';

    // When
    const state = extractStateFromUrl(url);

    // Then
    expect(state).toBeNull();
  });
});

describe('extractErrorFromUrl', () => {
  it('should extract error from URL', () => {
    // Given
    const url = 'https://example.com/callback?error=access_denied&error_description=User%20denied';

    // When
    const error = extractErrorFromUrl(url);

    // Then
    expect(error).toEqual({
      error: 'access_denied',
      errorDescription: 'User denied',
    });
  });

  it('should return null when no error', () => {
    // Given
    const url = 'https://example.com/callback';

    // When
    const error = extractErrorFromUrl(url);

    // Then
    expect(error).toBeNull();
  });
});

describe('buildQueryString', () => {
  it('should build query string from params', () => {
    // Given
    const params = {
      code: 'abc123',
      state: 'xyz789',
    };

    // When
    const queryString = buildQueryString(params);

    // Then
    expect(queryString).toContain('code=abc123');
    expect(queryString).toContain('state=xyz789');
  });

  it('should ignore undefined values', () => {
    // Given
    const params = {
      code: 'abc123',
      state: undefined,
    };

    // When
    const queryString = buildQueryString(params);

    // Then
    expect(queryString).not.toContain('state');
  });
});

describe('generateState', () => {
  it('should generate random state string', () => {
    // When
    const state1 = generateState();
    const state2 = generateState();

    // Then
    expect(state1).toBeDefined();
    expect(state1.length).toBeGreaterThan(0);
    expect(state1).not.toBe(state2);
  });

  it('should generate state with specified length', () => {
    // Given
    const length = 16;

    // When
    const state = generateState(length);

    // Then
    expect(state.length).toBe(length);
  });
});

describe('generateCodeVerifier', () => {
  it('should generate random code verifier', () => {
    // When
    const verifier1 = generateCodeVerifier();
    const verifier2 = generateCodeVerifier();

    // Then
    expect(verifier1).toBeDefined();
    expect(verifier1.length).toBeGreaterThan(0);
    expect(verifier1).not.toBe(verifier2);
  });

  it('should generate verifier with specified length', () => {
    // Given
    const length = 64;

    // When
    const verifier = generateCodeVerifier(length);

    // Then
    expect(verifier.length).toBe(length);
  });
});

describe('generateCodeChallenge', () => {
  it('should generate code challenge from verifier', async () => {
    // Given
    const verifier = generateCodeVerifier();

    // When
    const challenge = await generateCodeChallenge(verifier);

    // Then
    expect(challenge).toBeDefined();
    expect(challenge.length).toBeGreaterThan(0);
    expect(challenge).not.toContain('+');
    expect(challenge).not.toContain('/');
    expect(challenge).not.toContain('=');
  });

  it('should generate same challenge for same verifier', async () => {
    // Given
    const verifier = generateCodeVerifier();

    // When
    const challenge1 = await generateCodeChallenge(verifier);
    const challenge2 = await generateCodeChallenge(verifier);

    // Then
    expect(challenge1).toBe(challenge2);
  });
});

describe('isValidCallbackUrl', () => {
  it('should return true for matching URLs', () => {
    // Given
    const url = 'https://example.com/callback?code=abc';
    const expected = 'https://example.com/callback';

    // When
    const isValid = isValidCallbackUrl(url, expected);

    // Then
    expect(isValid).toBe(true);
  });

  it('should return false for different hosts', () => {
    // Given
    const url = 'https://example.com/callback';
    const expected = 'https://other.com/callback';

    // When
    const isValid = isValidCallbackUrl(url, expected);

    // Then
    expect(isValid).toBe(false);
  });

  it('should return false for different paths', () => {
    // Given
    const url = 'https://example.com/callback';
    const expected = 'https://example.com/other';

    // When
    const isValid = isValidCallbackUrl(url, expected);

    // Then
    expect(isValid).toBe(false);
  });

  it('should return false for invalid URLs', () => {
    // Given
    const url = 'not-a-url';
    const expected = 'https://example.com/callback';

    // When
    const isValid = isValidCallbackUrl(url, expected);

    // Then
    expect(isValid).toBe(false);
  });
});
