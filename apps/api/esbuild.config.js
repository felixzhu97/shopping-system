/**
 * esbuild configuration for Lambda function bundling
 * This configuration excludes dependencies that are provided by Lambda runtime or Lambda layers
 *
 * Best practice: Use plugins to automatically mark optional dependencies as external
 * instead of manually listing each one. This prevents build errors when new optional
 * dependencies are added to dd-trace or datadog-lambda-js.
 */

module.exports = {
  entryPoints: ['src/lambda.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/lambda.js',
  // Core external dependencies (always provided by Lambda runtime)
  external: ['aws-sdk'],
  plugins: [
    {
      name: 'external-optional-deps',
      setup(build) {
        // Mark all AWS SDK v3 packages as external (provided by Lambda runtime)
        build.onResolve({ filter: /^@aws-sdk\// }, () => ({ external: true }));

        // Mark all OpenTelemetry packages as external (provided by Datadog Lambda Layer)
        build.onResolve({ filter: /^@opentelemetry\// }, () => ({ external: true }));

        // Mark all Datadog optional dependencies as external (provided by Datadog Lambda Layer)
        // This includes: @datadog/pprof, @datadog/openfeature-node-server,
        // @datadog/wasm-js-rewriter, etc.
        build.onResolve({ filter: /^@datadog\// }, () => ({ external: true }));
      },
    },
  ],
};
