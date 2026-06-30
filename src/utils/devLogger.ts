/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DevLogEntry {
  id: string;
  timestamp: string;
  type: 'fetch' | 'error' | 'console';
  url?: string;
  method?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  status?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: string;
  parsedJson?: any;
  durationMs?: number;
  errorMessage?: string;
  errorStack?: string;
  errorFile?: string;
  errorLine?: number;
  apiRouteFailed?: string;
  contentType?: string;
  probableRootCause?: string;
  message?: string; // for console logs
  level?: 'info' | 'warn' | 'error';
}

declare global {
  interface Window {
    __DEV_MODE_LOGS__?: DevLogEntry[];
    __DEV_MODE_INTERCEPTOR_ACTIVE__?: boolean;
    __DEV_MODE_ORIGINAL_FETCH__?: typeof fetch;
  }
}

// Sensible lists of keys to mask
const SENSITIVE_KEYS = [
  'password',
  'token',
  'cookie',
  'authorization',
  'passwd',
  'secret',
  'key',
  'auth',
  'bearer'
];

function maskSensitiveData(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    // Try to see if it's a JSON string
    try {
      const parsed = JSON.parse(obj);
      return JSON.stringify(maskSensitiveData(parsed), null, 2);
    } catch (_) {
      // Just check if the string contains sensitive words and mask it or return as is
      return obj;
    }
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveData(item));
  }

  if (typeof obj === 'object') {
    const masked: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
        
        if (isSensitive) {
          masked[key] = '********';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          masked[key] = maskSensitiveData(obj[key]);
        } else {
          masked[key] = obj[key];
        }
      }
    }
    return masked;
  }

  return obj;
}

// Analyze probable cause based on status, response, or error
export function determineProbableCause(
  url: string,
  status?: number,
  responseBody?: string,
  errorMsg?: string
): string {
  if (errorMsg?.includes('Failed to fetch') || errorMsg?.includes('NetworkError')) {
    return 'CORS block, network disconnect, or the backend server is offline.';
  }
  if (status === 401) {
    return 'Unauthorized. Token expired, session invalidated, or credentials incorrect.';
  }
  if (status === 403) {
    return 'Forbidden. Client IP might be blocked, or you do not have permission.';
  }
  if (status === 404) {
    return 'Not Found. Invalid API endpoint. Ensure backend route matches exactly.';
  }
  if (status === 429) {
    return 'Rate Limited. Too many requests from this IP.';
  }
  if (status === 500) {
    if (responseBody?.includes('ENOENT') || responseBody?.includes('db.json')) {
      return 'Database failure: The JSON db file could not be read/written or is corrupted.';
    }
    return 'Internal Server Error. Backend crashed during execution. Check terminal/Vercel logs.';
  }
  if (responseBody && responseBody.trim().startsWith('<!DOCTYPE html>') || responseBody?.trim().startsWith('<html')) {
    return 'Server returned HTML instead of JSON. This often means the serverless route is misconfigured, Vercel had a routing error, or a 404/500 occurred and served the index.html fallback.';
  }
  return 'Unknown or custom application error.';
}

export function startDevInterception() {
  if (typeof window === 'undefined') return;
  if (window.__DEV_MODE_INTERCEPTOR_ACTIVE__) return;

  window.__DEV_MODE_LOGS__ = window.__DEV_MODE_LOGS__ || [];
  window.__DEV_MODE_INTERCEPTOR_ACTIVE__ = true;

  const pushLog = (entry: DevLogEntry) => {
    window.__DEV_MODE_LOGS__?.push(entry);
    // Keep last 1000 logs to avoid memory issues
    if (window.__DEV_MODE_LOGS__ && window.__DEV_MODE_LOGS__.length > 1000) {
      window.__DEV_MODE_LOGS__.shift();
    }
    // Dispatch custom event so Dev UI can update live
    window.dispatchEvent(new CustomEvent('dev-mode-log-added', { detail: entry }));
  };

  // --- 1. Intercept Fetch ---
  if (!window.__DEV_MODE_ORIGINAL_FETCH__) {
    window.__DEV_MODE_ORIGINAL_FETCH__ = window.fetch;
    
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const id = `fetch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const timestamp = new Date().toISOString();
      const originalFetch = window.__DEV_MODE_ORIGINAL_FETCH__!;

      let url = '';
      if (typeof input === 'string') url = input;
      else if (input instanceof URL) url = input.toString();
      else if (input instanceof Request) url = input.url;

      const method = init?.method || 'GET';
      
      // Parse request headers
      const requestHeaders: Record<string, string> = {};
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
            requestHeaders[key] = value;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            requestHeaders[key] = value;
          });
        } else {
          Object.assign(requestHeaders, init.headers);
        }
      }

      // Parse request body
      let requestBody: any = null;
      if (init?.body) {
        if (typeof init.body === 'string') {
          try {
            requestBody = JSON.parse(init.body);
          } catch (_) {
            requestBody = init.body;
          }
        } else {
          requestBody = '[Binary / FormData / Stream]';
        }
      }

      // Start timing
      const startTime = performance.now();

      try {
        const response = await originalFetch(input, init);
        const durationMs = Math.round(performance.now() - startTime);

        // Capture response details safely
        const clone = response.clone();
        const status = response.status;
        const responseHeaders: Record<string, string> = {};
        clone.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        const contentType = clone.headers.get('content-type') || 'text/plain';
        let responseBody = '';
        let parsedJson: any = null;

        try {
          responseBody = await clone.text();
          if (contentType.includes('application/json') || responseBody.trim().startsWith('{') || responseBody.trim().startsWith('[')) {
            try {
              parsedJson = JSON.parse(responseBody);
            } catch (_) {}
          }
        } catch (_) {
          responseBody = '[Unreadable stream]';
        }

        const probableRootCause = status >= 400 
          ? determineProbableCause(url, status, responseBody) 
          : undefined;

        pushLog({
          id,
          timestamp,
          type: 'fetch',
          url,
          method,
          requestHeaders: maskSensitiveData(requestHeaders),
          requestBody: maskSensitiveData(requestBody),
          status,
          responseHeaders: maskSensitiveData(responseHeaders),
          responseBody,
          parsedJson: maskSensitiveData(parsedJson),
          durationMs,
          contentType,
          apiRouteFailed: status >= 400 ? url : undefined,
          probableRootCause
        });

        // Trigger custom error analyzer dispatch if API fails
        if (status >= 400 || !contentType.includes('application/json')) {
          const apiErrEvent = new CustomEvent('dev-api-error', {
            detail: {
              url,
              method,
              status,
              responseBody,
              contentType,
              durationMs,
              probableRootCause: probableRootCause || 'Server returned non-JSON response or failed status.'
            }
          });
          window.dispatchEvent(apiErrEvent);
        }

        return response;
      } catch (err: any) {
        const durationMs = Math.round(performance.now() - startTime);
        const errorMessage = err.message || String(err);
        const errorStack = err.stack;
        const probableRootCause = determineProbableCause(url, undefined, undefined, errorMessage);

        pushLog({
          id,
          timestamp,
          type: 'fetch',
          url,
          method,
          requestHeaders: maskSensitiveData(requestHeaders),
          requestBody: maskSensitiveData(requestBody),
          status: 0,
          errorMessage,
          errorStack,
          durationMs,
          probableRootCause,
          apiRouteFailed: url
        });

        // Trigger custom error analyzer dispatch
        const apiErrEvent = new CustomEvent('dev-api-error', {
          detail: {
            url,
            method,
            status: 0,
            errorMessage,
            errorStack,
            durationMs,
            probableRootCause
          }
        });
        window.dispatchEvent(apiErrEvent);

        throw err;
      }
    };
  }

  // --- 2. Intercept uncaught errors ---
  const handleGlobalError = (event: ErrorEvent) => {
    const error = event.error;
    pushLog({
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: 'error',
      errorMessage: event.message || 'Global uncaught error',
      errorStack: error?.stack || '',
      errorFile: event.filename || '',
      errorLine: event.lineno,
      probableRootCause: 'Client-side runtime Javascript execution exception.'
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    pushLog({
      id: `rejection-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: 'error',
      errorMessage: reason?.message || String(reason) || 'Unhandled promise rejection',
      errorStack: reason?.stack || '',
      probableRootCause: 'An unhandled promise rejection occurred.'
    });
  };

  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // --- 3. Intercept console.error ---
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    originalConsoleError.apply(console, args);
    
    const message = args
      .map(arg => {
        if (arg instanceof Error) return `${arg.message}\n${arg.stack}`;
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (_) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    pushLog({
      id: `console-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: 'console',
      message,
      level: 'error'
    });
  };
}

export function getDevLogs(): DevLogEntry[] {
  if (typeof window === 'undefined') return [];
  return window.__DEV_MODE_LOGS__ || [];
}

export function clearDevLogs() {
  if (typeof window === 'undefined') return;
  window.__DEV_MODE_LOGS__ = [];
  window.dispatchEvent(new CustomEvent('dev-mode-log-added', { detail: null }));
}

export function generateDebugReport(envConfig: any): string {
  const logs = getDevLogs();
  
  const report = {
    title: 'Confessly Debug Report',
    generatedAt: new Date().toISOString(),
    browserInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      cookieEnabled: navigator.cookieEnabled
    },
    environmentDiagnostics: envConfig,
    statistics: {
      totalLogs: logs.length,
      fetchLogs: logs.filter(l => l.type === 'fetch').length,
      errorLogs: logs.filter(l => l.type === 'error').length,
      consoleLogs: logs.filter(l => l.type === 'console').length,
      failedFetchCount: logs.filter(l => l.type === 'fetch' && (l.status === 0 || (l.status || 0) >= 400)).length
    },
    logs: logs
  };

  return JSON.stringify(report, null, 2);
}
