/**
 * Datadog RUM (Real User Monitoring) Configuration for Browser/Client-side
 */

/**
 * Initialize Datadog RUM
 * This should be called on the client side (browser)
 */
export function initDatadogRUM() {
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Dynamic import to avoid SSR issues
  if (
    process.env.NEXT_PUBLIC_DD_RUM_APPLICATION_ID &&
    process.env.NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN
  ) {
    // Use dynamic import for browser-only code
    import('@datadog/browser-rum')
      .then(({ datadogRum }) => {
        datadogRum.init({
          applicationId: process.env.NEXT_PUBLIC_DD_RUM_APPLICATION_ID!,
          clientToken: process.env.NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN!,
          site: process.env.NEXT_PUBLIC_DD_SITE || 'datadoghq.com',
          service: process.env.NEXT_PUBLIC_DD_SERVICE || 'shopping-web',
          env:
            process.env.NEXT_PUBLIC_DD_ENV ||
            process.env.NODE_ENV ||
            'development',
          version: process.env.NEXT_PUBLIC_DD_VERSION || '1.0.0',
          sessionSampleRate: 100, // 100% of sessions will be sent to Datadog
          sessionReplaySampleRate: 10, // 10% of sessions will have session replay enabled
          trackUserInteractions: true,
          trackResources: true,
          trackLongTasks: true,
          defaultPrivacyLevel: 'mask-user-input', // Mask user input for privacy
          beforeSend: () => {
            // Filter out sensitive data or modify events before sending
            // Return true to send the event, false to drop it
            return true;
          },
        });

        // Set user information if available
        if (process.env.NEXT_PUBLIC_DD_RUM_USER_EMAIL) {
          datadogRum.setUser({
            email: process.env.NEXT_PUBLIC_DD_RUM_USER_EMAIL,
          });
        }
      })
      .catch((error) => {
        // Silently fail if Datadog RUM cannot be loaded
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to initialize Datadog RUM:', error);
        }
      });
  }
}
