import { Injectable, signal } from '@angular/core';

export type Session = {
  apiBaseUrl: string;
  adminSecret: string;
  token: string;
  userId: string;
  email?: string;
};

const sessionStorageKey = 'admin.session.v1';
const defaultApiBaseUrl = 'http://localhost:3001/api';

function normalizeApiBaseUrl(input: string): string {
  let value = input.trim();
  if (!value) return defaultApiBaseUrl;
  value = value.replace(/\/+$/, '');
  if (value.endsWith('/api')) return value;
  return `${value}/api`;
}

function safeJsonParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['apiBaseUrl'] === 'string' &&
    typeof v['adminSecret'] === 'string' &&
    typeof v['token'] === 'string' &&
    typeof v['userId'] === 'string'
  );
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<Session | null>(this.loadSession());

  get session(): Session | null {
    return this.sessionSignal();
  }

  get isAuthenticated(): boolean {
    const session = this.sessionSignal();
    return !!session?.token && !!session?.apiBaseUrl;
  }

  get apiBaseUrl(): string {
    return this.sessionSignal()?.apiBaseUrl ?? defaultApiBaseUrl;
  }

  get token(): string {
    return this.sessionSignal()?.token ?? '';
  }

  get adminSecret(): string {
    return this.sessionSignal()?.adminSecret ?? '';
  }

  setSession(input: Omit<Session, 'apiBaseUrl'> & { apiBaseUrl: string }): void {
    const session: Session = {
      ...input,
      apiBaseUrl: normalizeApiBaseUrl(input.apiBaseUrl),
      adminSecret: input.adminSecret.trim(),
      token: input.token.trim(),
      userId: input.userId.trim(),
      email: input.email?.trim(),
    };
    this.sessionSignal.set(session);
    localStorage.setItem(sessionStorageKey, JSON.stringify(session));
  }

  clearSession(): void {
    this.sessionSignal.set(null);
    localStorage.removeItem(sessionStorageKey);
  }

  private loadSession(): Session | null {
    const parsed = safeJsonParse(localStorage.getItem(sessionStorageKey));
    if (!isSession(parsed)) return null;
    return {
      ...parsed,
      apiBaseUrl: normalizeApiBaseUrl(parsed.apiBaseUrl),
      adminSecret: parsed.adminSecret.trim(),
      token: parsed.token.trim(),
      userId: parsed.userId.trim(),
      email: parsed.email?.trim(),
    };
  }
}

