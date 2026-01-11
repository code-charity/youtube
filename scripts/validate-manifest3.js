#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const argv = process.argv.slice(2);
const file = argv[0] || 'build/manifest3.json';
const filePath = path.resolve(process.cwd(), file);

if (!fs.existsSync(filePath)) {
  console.error('Error: manifest file not found:', filePath);
  process.exit(2);
}

const manifest = readJSON(filePath);
const errors = [];
const warnings = [];

if (manifest.manifest_version !== 3) {
  errors.push(`manifest_version expected 3, found ${manifest.manifest_version}`);
}

if (!manifest.background || !manifest.background.service_worker) {
  errors.push('background.service_worker is missing — ensure the manifest points to the MV3 service worker');
}

if (Array.isArray(manifest.permissions) && manifest.permissions.includes('webRequest')) {
  warnings.push('Manifest requests `webRequest` permission. Blocking webRequest is restricted in MV3; consider `declarativeNetRequest`.');
}

if (manifest.content_security_policy) {
  warnings.push('content_security_policy is present — verify CSP is valid for MV3 service worker and extension pages.');
}

if (errors.length === 0) {
  console.log('Manifest checks passed (warnings may exist).');
} else {
  console.error('Manifest checks failed.');
}

if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach(w => console.log('- ' + w));
}

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log('- ' + e));
  process.exit(2);
}

process.exit(0);
