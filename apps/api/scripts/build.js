/**
 * Build script for Lambda function using esbuild
 * This script uses the esbuild.config.js configuration
 */

const esbuild = require('esbuild');
const config = require('../esbuild.config.js');

async function build() {
  try {
    await esbuild.build(config);
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
