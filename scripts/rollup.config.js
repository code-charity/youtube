import multi from '@rollup/plugin-multi-entry';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import fs from 'fs';
import path from 'path';

// Determine input sources: prefer env var SW_SOURCES (comma-separated),
// otherwise try to read build/manifest2.json background.scripts.
function getInputs() {
  const env = process.env.SW_SOURCES || process.env.INPUTS;
  if (env) return env.split(',').map(s => s.trim()).filter(Boolean);

  const manifestPath = path.resolve(process.cwd(), 'build', 'manifest2.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (m.background && Array.isArray(m.background.scripts) && m.background.scripts.length > 0) {
        return m.background.scripts.map(s => path.resolve(process.cwd(), s));
      }
    } catch (err) {
      // ignore
    }
  }
  throw new Error('No SW input sources specified. Set env SW_SOURCES or ensure build/manifest2.json has background.scripts.');
}

const inputs = getInputs();

export default {
  input: inputs,
  plugins: [
    multi(),
    nodeResolve({ browser: true }),
    commonjs(),
    terser()
  ],
  output: {
    file: path.resolve(process.cwd(), 'build', 'generated_service_worker.js'),
    format: 'iife',
    name: 'GeneratedServiceWorker',
    sourcemap: false
  }
};
