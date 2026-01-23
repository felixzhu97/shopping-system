/**
 * Datadog APM and Logging Configuration for Node.js/Server-side
 */

/**
 * Initialize Datadog APM tracer
 * This must be imported before any other modules
 */
export function initDatadogAPM() {
  if (process.env.DD_SERVICE && process.env.DD_ENV) {
    // Only initialize in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('dd-trace').init({
        service: process.env.DD_SERVICE || 'shopping-api',
        env: process.env.DD_ENV || process.env.NODE_ENV || 'development',
        version: process.env.DD_VERSION || '1.0.0',
        logInjection: true, // Enable log correlation
        runtimeMetrics: true, // Enable runtime metrics
        profiling: process.env.DD_PROFILING_ENABLED === 'true',
        // APM configuration
        appsec: process.env.DD_APPSEC_ENABLED === 'true',
        // Tags
        tags: {
          'service.name': process.env.DD_SERVICE || 'shopping-api',
          env: process.env.DD_ENV || process.env.NODE_ENV || 'development',
        },
      });
    }
  }
}
