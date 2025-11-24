#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/convert-manifest.js --input <input.json> --output <output.json> [--bundle-sw]');
}

// Minimal CLI parsing (avoids external dependency)
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' || a === '-i') {
      out.input = argv[++i];
    } else if (a === '--output' || a === '-o') {
      out.output = argv[++i];
    } else if (a === '--bundle-sw') {
      out.bundleSw = true;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const inputPath = args.input;
const outputPath = args.output;

if (!inputPath || !outputPath) {
  usage();
  process.exit(2);
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function convertManifestV2toV3(manifest) {
  const m = JSON.parse(JSON.stringify(manifest));
  m.manifest_version = 3;
  const warnings = [];
  const meta = {};

  // background.scripts -> background.service_worker (best-effort)
  if (m.background && Array.isArray(m.background.scripts) && m.background.scripts.length > 0) {
    m.background = m.background || {};
    const scripts = m.background.scripts.slice();
    // choose the first script as service worker entry (best-effort)
    const worker = scripts[0] || 'background.js';
    m.background.service_worker = worker;
    delete m.background.scripts;
    // record background scripts (even if only one) so bundling can run when requested
    meta.backgroundScripts = scripts;
    if (scripts.length > 1) {
      warnings.push(`Found multiple background.scripts (${scripts.length}). Consider bundling into a single service worker.`);
    }
  }

  // browser_action -> action
  if (m.browser_action && !m.action) {
    m.action = m.browser_action;
    delete m.browser_action;
  }

  // content_security_policy may need manual adjustment; attempt minimal transform
  if (m.content_security_policy && typeof m.content_security_policy === 'string') {
    warnings.push('`content_security_policy` is present — verify and adapt for MV3 (service worker CSP differences).');
  }

  // host_permissions exist in MV3; move any match patterns from permissions if present (best-effort)
  if (Array.isArray(m.permissions)) {
    const hostPerms = m.permissions.filter(p => /^(https?:|file:|\*)/.test(p));
    if (hostPerms.length > 0) {
      m.host_permissions = (m.host_permissions || []).concat(hostPerms);
      // remove them from permissions
      m.permissions = m.permissions.filter(p => !hostPerms.includes(p));
      if (m.permissions.length === 0) delete m.permissions;
      warnings.push(`Moved ${hostPerms.length} host permission(s) from \`permissions\` to \`host_permissions\`.`);
    }
  }

  // Basic check for possibly deprecated blocking webRequest usage
  if (Array.isArray(manifest.permissions) && manifest.permissions.includes('webRequest')) {
    warnings.push('Manifest requests `webRequest`. If you relied on blocking webRequest listeners, adapt to MV3 restrictions (use declarativeNetRequest or service worker approaches).');
  }

  return { manifest: m, warnings, meta };
}

try {
  const input = path.resolve(process.cwd(), inputPath);
  const output = path.resolve(process.cwd(), outputPath);
  const manifest = readJSON(input);
  if (manifest.manifest_version === 3) {
    console.log('Input already manifest_version 3 — copying to output.');
    writeJSON(output, manifest);
    process.exit(0);
  }
  const result = convertManifestV2toV3(manifest);
  const converted = result.manifest;

  // If bundling requested and multiple background scripts detected, try bundling with rollup first,
  // otherwise fall back to a simple importScripts wrapper.
  if (args.bundleSw && result.meta && Array.isArray(result.meta.backgroundScripts) && result.meta.backgroundScripts.length > 0) {
    const outDir = path.dirname(output);
    const genName = 'generated_service_worker.js';
    const genPath = path.join(outDir, genName);
    const scripts = result.meta.backgroundScripts.map(s => s.replace(/\\/g, '/'));

    // Try using rollup (npx) if available. We pass the sources via env var SW_SOURCES.
    const cp = require('child_process');
    let bundled = false;
    try {
      const env = Object.assign({}, process.env, { SW_SOURCES: scripts.join(',') });
      console.log('Running rollup to bundle service worker (via npx)...');
      cp.execSync('npx rollup -c scripts/rollup.config.js', { stdio: 'inherit', env });
      if (fs.existsSync(genPath)) {
        bundled = true;
        console.log('Rollup produced', genPath);
      }
    } catch (err) {
      console.warn('Rollup bundling failed or not available — falling back to importScripts wrapper. Error:', err.message);
    }

    if (!bundled) {
      // fallback: simple importScripts wrapper
      const importArgs = scripts.map(s => `'${s}'`).join(', ');
      const genContent = `// Generated by scripts/convert-manifest.js\n// Fallback importScripts wrapper — review before publishing.\nimportScripts(${importArgs});\n`;
      fs.writeFileSync(genPath, genContent, 'utf8');
      console.log('Wrote fallback service worker wrapper to', genPath);
    }

    // set manifest to use generated worker path relative to repository root
    const rel = path.relative(process.cwd(), genPath).replace(/\\\\/g, '/');
    converted.background = converted.background || {};
    converted.background.service_worker = rel;
  }

  writeJSON(output, converted);
  console.log('Converted manifest written to', output);

  // Print any warnings collected during conversion
  if (result.warnings && result.warnings.length > 0) {
    console.log('\nConversion warnings:');
    result.warnings.forEach(w => console.log('- ' + w));
  }
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
