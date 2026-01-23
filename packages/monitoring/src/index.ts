/**
 * Monitoring Exports
 * 
 * For client-side usage, import from './client'
 * For server-side usage, import from './server' or './datadog/apm'
 */

// Client-side exports (RUM only)
export { initDatadogRUM } from './datadog/rum';

// Server-side exports (APM only)
export { initDatadogAPM } from './datadog/apm';
