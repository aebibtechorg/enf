import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const configDir = path.join(root, 'config');
const configPath = path.join(configDir, 'app-name.json');

function sanitizePackageRoot(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function printUsage() {
  console.log(`
Usage: node scripts/set-app-name.mjs [options]

Options:
  --name <value>       New app name (e.g. my-app)
  --display <value>    New display name (e.g. "My App")
  --scope <value>      New npm scope (e.g. my-app)
  --android <value>    New android package root (e.g. myapp)
  --scheme <value>     New mobile url scheme (e.g. myapp)
  --apply               Apply changes to files (required to modify files)
  --dry-run             Show what would change, do not write files
  -h, --help            Show this help

Examples:
  # Show current config
  node scripts/set-app-name.mjs

  # Preview replacing current values with a new name
  node scripts/set-app-name.mjs --name my-app --display "My App"

  # Apply changes
  node scripts/set-app-name.mjs --name my-app --apply
`);
}

function parseArgs(argv) {
  const args = { apply: false, dryRun: false, partial: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') args.apply = true;
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--name' && argv[i + 1]) args.partial.appName = argv[++i];
    else if (a === '--display' && argv[i + 1]) args.partial.displayName = argv[++i];
    else if (a === '--scope' && argv[i + 1]) args.partial.npmScope = argv[++i];
    else if (a === '--android' && argv[i + 1]) args.partial.androidPackageRoot = argv[++i];
    else if (a === '--scheme' && argv[i + 1]) args.partial.androidUrlScheme = argv[++i];
    else if (a === '-h' || a === '--help') { args.help = true; }
    else if (a.trim() === '') continue;
    else console.warn('Unknown arg', a);
  }
  return args;
}

async function readConfig() {
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

async function writeConfig(cfg) {
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
}

const TEXT_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.md', '.html', '.astro', '.css', '.scss', '.yml', '.yaml', '.cs', '.csproj', '.slnx', '.xml', '.kt', '.kts', '.gradle', '.properties', '.dart', '.java', '.txt', '.env', '.lock', '.toml', '.ini'
]);

const IGNORE_DIRS = new Set(['node_modules', '.git', '.gradle', '.idea', '.vscode', '.turbo', '.next', 'dist', 'out', '.dart_tool']);

async function walk(dir, cb) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip typical build output folders
      if (entry.name === 'bin' || entry.name === 'obj' || entry.name === 'build') continue;
      await walk(full, cb);
    } else if (entry.isFile()) {
      await cb(full);
    }
  }
}

function replaceAllStrings(text, map) {
  let out = text;
  for (const { oldStr, newStr } of map) {
    if (!oldStr) continue;
    out = out.split(oldStr).join(newStr);
  }
  return out;
}

function escapeHtmlAttr(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(s) {
  return escapeHtmlAttr(s);
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printUsage(); return; }

  const existing = await readConfig();
  const defaults = {
    appName: 'Example App',
    displayName: 'Example App',
    npmScope: 'Example App',
    androidPackageRoot: 'exampleapp',
    androidUrlScheme: 'exampleapp'
  };
  const oldCfg = existing || defaults;

  const newCfg = { ...oldCfg, ...args.partial };
  // ensure androidPackageRoot and npmScope sane defaults
  if (!newCfg.androidPackageRoot) newCfg.androidPackageRoot = sanitizePackageRoot(newCfg.appName);
  if (!newCfg.npmScope) newCfg.npmScope = newCfg.appName;

  if (!args.apply && Object.keys(args.partial).length === 0) {
    console.log('Current example-app config:\n', JSON.stringify(oldCfg, null, 2));
    console.log('\nNo changes requested. To apply replacements, pass flags (e.g. --name) and --apply.');
    return;
  }

  // Build mapping of replacements from old -> new
  const oldNoHyphen = sanitizePackageRoot(oldCfg.appName || '');
  const newNoHyphen = sanitizePackageRoot(newCfg.appName || '');

  const mapping = [
    { oldStr: oldCfg.appName, newStr: newCfg.appName },
    { oldStr: `@${oldCfg.npmScope}`, newStr: `@${newCfg.npmScope}` },
    { oldStr: oldCfg.npmScope, newStr: newCfg.npmScope },
    { oldStr: oldCfg.displayName, newStr: newCfg.displayName },
    { oldStr: oldCfg.androidPackageRoot, newStr: newCfg.androidPackageRoot },
    { oldStr: oldCfg.androidUrlScheme, newStr: newCfg.androidUrlScheme },
    { oldStr: oldNoHyphen, newStr: newNoHyphen }
  ];

  // If nothing actually changed, exit
  const changesRequested = mapping.some(m => m.oldStr !== m.newStr);
  if (!changesRequested) {
    console.log('No textual changes detected between current config and requested values.');
    if (!args.apply) console.log('Use --apply to force writing the config file.');
    // still write config if apply requested
    if (args.apply && !existing) {
      await writeConfig(newCfg);
      console.log('Wrote new config to', configPath);
    }
    return;
  }

  // Collect changed files
  const changed = [];
  const inspected = [];

  await walk(root, async (file) => {
    // avoid editing the config file itself until after replacements
    if (path.resolve(file) === path.resolve(configPath)) return;
    // only process text-like files by extension
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXTENSIONS.has(ext)) return;
    try {
      const stat = await fs.stat(file);
      if (stat.size > 2_000_000) return; // skip very large files
      const raw = await fs.readFile(file, 'utf8');
      inspected.push(file);

      let updated = raw;
      let madeHtmlReplacements = false;

      // HTML-specific replacements: update <title> and common meta tags to new display name
      if (ext === '.html' || ext === '.htm') {
        const newTitle = newCfg.displayName || newCfg.appName || newCfg.npmScope || '';
        // Replace title tag if present
        if (/<title[\s\S]*?<\/title>/i.test(updated)) {
          updated = updated.replace(/<title[\s\S]*?<\/title>/i, `<title>${escapeHtml(newTitle)}</title>`);
        }
        // Replace meta name="apple-mobile-web-app-title" content="..."
        updated = updated.replace(/(<meta\s+[^>]*name=["']apple-mobile-web-app-title["'][^>]*content=["'])([^"']*)(["'][^>]*>)/ig, `$1${escapeHtmlAttr(newTitle)}$3`);
        // Replace meta name="application-name"
        updated = updated.replace(/(<meta\s+[^>]*name=["']application-name["'][^>]*content=["'])([^"']*)(["'][^>]*>)/ig, `$1${escapeHtmlAttr(newTitle)}$3`);
        // Replace og:site_name
        updated = updated.replace(/(<meta\s+[^>]*property=["']og:site_name["'][^>]*content=["'])([^"']*)(["'][^>]*>)/ig, `$1${escapeHtmlAttr(newTitle)}$3`);
        if (updated !== raw) madeHtmlReplacements = true;
      }

      // Build mapping-based replacements (use updated as base)
      let shouldReplace = madeHtmlReplacements;
      if (!shouldReplace) {
        for (const m of mapping) {
          if (m.oldStr && updated.includes(m.oldStr)) { shouldReplace = true; break; }
        }
      }
      if (!shouldReplace) return;

      const final = replaceAllStrings(updated, mapping);
      if (final !== raw) {
        changed.push(file);
        if (args.dryRun) return;
        await fs.writeFile(file, final, 'utf8');
      }
    } catch (err) {
      // ignore read/write errors for files we don't have permissions for
    }
  });

  // Write the config file if applying
  if (args.apply) {
    await writeConfig(newCfg);
  }

  console.log('\nSummary:');
  console.log('  Files inspected:', inspected.length);
  console.log('  Files changed:', changed.length);
  if (changed.length > 0) console.log('  Changed files sample:', changed.slice(0, 20).join('\n    '));
  if (!args.apply) console.log('\nNote: nothing was written. Re-run with --apply to perform changes.');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
