#!/usr/bin/env node
// scripts/obfuscate-token.js
// Usage: node obfuscate-token.js <GITHUB_TOKEN>
// Produces a JavaScript array of Base64 fragments compatible with gist-storage.js

function encodeToken(token, partsCount = 4) {
  const len = Math.ceil(token.length / partsCount);
  const parts = [];
  for (let i = 0; i < partsCount; i++) {
    const part = token.slice(i * len, (i + 1) * len);
    // shift each char by +(i % 3)
    const shifted = part.split('').map(c => String.fromCharCode(c.charCodeAt(0) + (i % 3))).join('');
    const b64 = Buffer.from(shifted, 'utf8').toString('base64');
    parts.push(b64);
  }
  return parts;
}

function usage() {
  console.log('Usage: node obfuscate-token.js <GITHUB_TOKEN> [partsCount]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 1) usage();
const token = args[0];
const partsCount = args[1] ? parseInt(args[1], 10) : 4;
if (!token) usage();

const parts = encodeToken(token, partsCount);
console.log('// Paste the following array into gist-storage.js (replace the parts array)');
console.log('[');
parts.forEach(p => console.log("  '" + p + "',"));
console.log(']');

console.log('\n// Sample getGithubToken() to use with these parts:');
console.log(`function getGithubToken() {`);
console.log(`  const parts = ${JSON.stringify(parts)};`);
console.log(`  const decoded = parts.map((p,i)=>{ try{ const b = atob(p); return b.split('').map(c=>String.fromCharCode(c.charCodeAt(0)-(i%3))).join('');}catch(e){return ''}});`);
console.log(`  return decoded.join('');`);
console.log(`}`);
