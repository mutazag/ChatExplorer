#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

function pathToPosix(p) { return p.replace(/\\/g, '/'); }

function matchesDeny(p, denies) {
  // Simple rules for the patterns we use
  const posix = pathToPosix(p);
  for (const pat of denies) {
    if (pat.endsWith('/')) {
      if (posix.startsWith(pat)) return true;
      continue;
    }
    if (pat === '.specify/' && (posix.includes('/.specify/') || posix.startsWith('.specify/'))) return true;
    if (pat === '**/*.test.*') {
      if (/\.test\.[^/]+$/.test(posix)) return true;
    }
  }
  return false;
}

async function main() {
  const manifestPath = process.argv[2];
  const filtersPath = process.argv[3];
  if (!manifestPath || !filtersPath) {
    console.error('Usage: validate-manifest.mjs <manifest.json> <filters.json>');
    process.exit(2);
  }
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const filters = JSON.parse(await fs.readFile(filtersPath, 'utf8'));
  const denies = filters.deny || [];

  const violations = [];
  for (const item of manifest.items || []) {
    if (matchesDeny(item.path, denies)) {
      violations.push(item.path);
    }
  }

  if (violations.length > 0) {
    console.error(`Found prohibited paths in manifest (count=${violations.length}):`);
    for (const v of violations) console.error(` - ${v}`);
    process.exit(1);
  }

  console.log('Manifest validation passed: no prohibited paths found.');
}

main().catch((err) => { console.error(err); process.exit(1); });
