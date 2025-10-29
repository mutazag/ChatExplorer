#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

const OUT_ROOT = process.env.ARTIFACT_DIR || path.join(repoRoot, 'artifact-out', 'build-artifacts');

/**
 * Recursively copy a directory tree (files and directories)
 */
async function copyDir(srcDir, destDir, manifest) {
  await fs.mkdir(destDir, { recursive: true });
  manifest.items.push({ path: path.relative(repoRoot, destDir).replace(/\\/g, '/'), type: 'dir' });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, manifest);
    } else if (entry.isFile()) {
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      await fs.copyFile(srcPath, destPath);
      const st = await fs.stat(destPath);
      manifest.items.push({ path: path.relative(repoRoot, destPath).replace(/\\/g, '/'), type: 'file', size: st.size });
    }
  }
}

// (removed) replicateDirsOnly: we now include full data/ contents to ensure datasets are present in artifacts

async function main() {
  const commit = process.env.GITHUB_SHA || 'local';
  const shortSha = commit.slice(0, 7);
  const name = `build-artifacts-${shortSha || 'local'}`;
  const createdAt = new Date().toISOString();

  // Prepare output root (clean)
  await fs.rm(OUT_ROOT, { recursive: true, force: true });
  await fs.mkdir(OUT_ROOT, { recursive: true });

  const manifest = {
    artifactId: name,
    generatedAt: createdAt,
    items: [],
    metadata: { commit, createdAt, name }
  };

  // Include runtime files/directories
  const includeFiles = ['index.html', 'styles.css'];
  for (const rel of includeFiles) {
    const src = path.join(repoRoot, rel);
    const exists = await fs.access(src).then(() => true).catch(() => false);
    if (!exists) continue;
    const dest = path.join(OUT_ROOT, rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
    const st = await fs.stat(dest);
    manifest.items.push({ path: path.relative(repoRoot, dest).replace(/\\/g, '/'), type: 'file', size: st.size });
  }

  const includeDirs = ['assets', 'src'];
  for (const rel of includeDirs) {
    const src = path.join(repoRoot, rel);
    const exists = await fs.access(src).then(() => true).catch(() => false);
    if (!exists) continue;
    const dest = path.join(OUT_ROOT, rel);
    await copyDir(src, dest, manifest);
  }

  // Include data/ directory (with files) so datasets are available in the artifact
  const dataSrc = path.join(repoRoot, 'data');
  const dataDest = path.join(OUT_ROOT, 'data');
  const dataExists = await fs.access(dataSrc).then(() => true).catch(() => false);
  if (dataExists) {
    await copyDir(dataSrc, dataDest, manifest);
  } else {
    // Ensure a data/ root exists in the artifact for stability
    await fs.mkdir(dataDest, { recursive: true });
    manifest.items.push({ path: path.relative(repoRoot, dataDest).replace(/\\/g, '/'), type: 'dir' });
  }

  // Write manifest.json
  const manifestPath = path.join(OUT_ROOT, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify({
    artifactId: manifest.artifactId,
    generatedAt: manifest.generatedAt,
    items: manifest.items,
    metadata: manifest.metadata
  }, null, 2));

  // Emit minimal console info for job summary step to parse if needed
  console.log(JSON.stringify({ outDir: OUT_ROOT, manifest: path.relative(repoRoot, manifestPath).replace(/\\/g, '/') }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
