#!/usr/bin/env node
// Brand-aware wrapper around the Expo CLI.
//
//   npm run dev -- <brand>          start the dev server
//   npm run ios -- <brand>          build + run the brand's app on the iOS simulator
//   npm run ios -- <brand> --device build + run on a connected iPhone
//   npm run android -- <brand>      build + run on an Android emulator
//   npm run brand:check -- <brand>  validate brands/<brand>
//   npm run brand:new -- <brand>    scaffold brands/<brand> from the demo brand
//
// <brand> defaults to $BRAND, then "frozenholm". Extra flags are passed to the Expo CLI.

const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const brandsDir = path.join(root, 'brands');
const [command, ...rest] = process.argv.slice(2);
const brandArg = rest.find((arg) => !arg.startsWith('-'));
const passthrough = rest.filter((arg) => arg !== brandArg);
const brandKey = brandArg ?? process.env.BRAND ?? 'frozenholm';

const tokenVar = (key) => `${key.toUpperCase().replace(/-/g, '_')}_STOREFRONT_TOKEN`;

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, BRAND: brandKey },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Loads .env / .env.local the same way the Expo CLI does, so `check` sees the token.
function loadEnv() {
  for (const file of ['.env', '.env.local']) {
    const p = path.join(root, file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

function check() {
  const dir = path.join(brandsDir, brandKey);
  const configPath = path.join(dir, 'config.json');
  if (!fs.existsSync(configPath)) {
    const known = fs.readdirSync(brandsDir).filter((d) => fs.existsSync(path.join(brandsDir, d, 'config.json')));
    fail(`Unknown brand "${brandKey}". Available: ${known.join(', ')}`);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    fail(`brands/${brandKey}/config.json is not valid JSON: ${e.message}`);
  }

  const errors = [];
  const required = [
    'name', 'slug', 'scheme', 'version',
    'ios.bundleIdentifier', 'android.package',
    'shopify.storeDomain', 'shopify.apiVersion',
    'theme.primary', 'theme.onPrimary', 'theme.background', 'theme.surface',
    'theme.text', 'theme.textMuted', 'theme.border', 'theme.radius',
    'copy.homeTitle', 'copy.homeSubtitle',
  ];
  for (const key of required) {
    const value = key.split('.').reduce((o, k) => o?.[k], config);
    if (value === undefined || value === '') errors.push(`missing "${key}"`);
  }
  for (const [key, value] of Object.entries(config.theme ?? {})) {
    if (key !== 'radius' && !/^#[0-9a-fA-F]{6}$/.test(value)) errors.push(`theme.${key} must be a #RRGGBB color`);
  }
  for (const file of ['icon.png', 'splash.png', 'content.ts']) {
    if (!fs.existsSync(path.join(dir, file))) errors.push(`missing brands/${brandKey}/${file}`);
  }
  if (errors.length) fail(`brands/${brandKey} is invalid:\n  - ${errors.join('\n  - ')}`);

  loadEnv();
  const warnings = [];
  if (!config.shopify.endpoint && !process.env[tokenVar(brandKey)]) {
    warnings.push(`${tokenVar(brandKey)} is not set in .env.local — Storefront API calls will fail`);
  }
  if (!config.ios.appleTeamId) warnings.push('ios.appleTeamId not set — Xcode will ask which team signs the app');
  if (!config.shopify.customerAccountClientId || !config.shopify.shopId) {
    warnings.push('shopify.customerAccountClientId / shopId not set — customer sign-in is hidden');
  }
  if (!config.ios.appleMerchantId) warnings.push('ios.appleMerchantId not set — Apple Pay buttons disabled');

  console.log(`✔ ${config.name} (brands/${brandKey})`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  return config;
}

// Native projects are generated per brand (bundle ID, team, icon, entitlements),
// so regenerate them whenever the brand or its config/assets change.
function prebuildIfNeeded(platform) {
  const hash = crypto.createHash('sha1');
  for (const file of ['config.json', 'icon.png', 'splash.png']) {
    hash.update(fs.readFileSync(path.join(brandsDir, brandKey, file)));
  }
  const stamp = `${brandKey}:${hash.digest('hex')}`;
  const marker = path.join(root, platform, '.storeshell-brand');
  const current = fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8').trim() : null;
  if (current !== stamp) {
    console.log(`\n→ Generating ${platform}/ for ${brandKey}\n`);
    run('npx', ['expo', 'prebuild', '--clean', '--platform', platform]);
    fs.writeFileSync(marker, stamp);
  }
}

function scaffold() {
  if (!brandArg) fail('Usage: npm run brand:new -- <brand>');
  if (!/^[a-z0-9-]+$/.test(brandKey)) fail('Brand name must be lowercase letters, numbers and dashes');
  const dir = path.join(brandsDir, brandKey);
  if (fs.existsSync(dir)) fail(`brands/${brandKey} already exists`);

  fs.cpSync(path.join(brandsDir, 'demo'), dir, { recursive: true });
  const config = JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'utf8'));
  const id = brandKey.replace(/-/g, '');
  Object.assign(config, { name: brandKey, slug: brandKey, scheme: id });
  config.ios = { bundleIdentifier: `com.${id}.app` };
  config.android = { package: `com.${id}.app` };
  config.shopify = { storeDomain: `${brandKey}.myshopify.com`, apiVersion: config.shopify.apiVersion };
  fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify(config, null, 2) + '\n');

  console.log(`✔ Created brands/${brandKey}. Next:
  1. Edit brands/${brandKey}/config.json (name, colors, store domain, bundle ID)
  2. Replace icon.png (1024×1024) and splash.png with the brand's own artwork, and put
     its logo (transparent PNG), photos, copy and onboarding choices in content.ts
  3. Add ${tokenVar(brandKey)}=... to .env.local
  4. npm run ios -- ${brandKey}`);
}

switch (command) {
  case 'check':
    check();
    break;
  case 'dev':
    check();
    run('npx', ['expo', 'start', '--dev-client', ...passthrough]);
    break;
  case 'ios':
  case 'android':
    check();
    prebuildIfNeeded(command);
    run('npx', ['expo', `run:${command}`, ...passthrough]);
    break;
  case 'new':
    scaffold();
    break;
  default:
    fail(`Unknown command "${command ?? ''}". Use: dev, ios, android, check, new`);
}
