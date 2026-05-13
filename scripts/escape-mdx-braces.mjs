#!/usr/bin/env node
// One-time sweep: Mintlify tolerated bare { and } in markdown body text
// because it preprocessed before MDX. Astro/Starlight feeds files to MDX
// directly, where bare braces look like JS expressions and break (worst
// case inside markdown tables, where `|` inside the brace splits cells).
//
// This script walks every .mdx file in the repo and replaces `{` -> `\{`
// and `}` -> `\}` everywhere EXCEPT inside fenced code blocks, inline
// code, the YAML front-matter, and already-escaped braces.
//
// Idempotent: re-running on a file with already-escaped braces is a no-op.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIRS = ['', 'architecture', 'subsystems', 'flows', 'runbooks'];

function escapeLine(line) {
  // Walk char-by-char. Track inline-code (single backtick) toggles.
  // Outside inline code: escape bare { and }.
  // Inside inline code AND in a markdown table row: escape bare |
  // (MDX table parser otherwise splits the cell mid-expression and
  // leaves an unclosed brace, which crashes the MDX compile).
  const isTableRow = line.trimStart().startsWith('|');
  let out = '';
  let inInlineCode = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = i > 0 ? line[i - 1] : '';
    if (ch === '`') {
      inInlineCode = !inInlineCode;
      out += ch;
      continue;
    }
    if (!inInlineCode && (ch === '{' || ch === '}')) {
      if (prev === '\\') {
        out += ch;
        continue;
      }
      out += '\\' + ch;
      continue;
    }
    if (inInlineCode && isTableRow && ch === '|') {
      if (prev === '\\') {
        out += ch;
        continue;
      }
      out += '\\|';
      continue;
    }
    out += ch;
  }
  return out;
}

function processFile(absPath) {
  const raw = fs.readFileSync(absPath, 'utf8');
  const lines = raw.split('\n');
  let inFence = false;
  let inFrontmatter = false;
  let seenFrontmatterEnd = false;
  const out = [];
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (idx === 0 && line.trim() === '---') {
      inFrontmatter = true;
      out.push(line);
      continue;
    }
    if (inFrontmatter && line.trim() === '---' && !seenFrontmatterEnd) {
      inFrontmatter = false;
      seenFrontmatterEnd = true;
      out.push(line);
      continue;
    }
    if (inFrontmatter) {
      out.push(line);
      continue;
    }
    const fenceMatch = line.match(/^\s*(```|~~~)/);
    if (fenceMatch) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    out.push(escapeLine(line));
  }
  const next = out.join('\n');
  if (next !== raw) {
    fs.writeFileSync(absPath, next);
    return true;
  }
  return false;
}

let touched = 0;
for (const dir of DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  if (fs.statSync(abs).isFile()) {
    if (abs.endsWith('.mdx')) {
      if (processFile(abs)) touched++;
    }
    continue;
  }
  for (const f of fs.readdirSync(abs)) {
    if (!f.endsWith('.mdx')) continue;
    if (processFile(path.join(abs, f))) touched++;
  }
}

// Also process index.mdx at root
const idx = path.join(ROOT, 'index.mdx');
if (fs.existsSync(idx)) {
  if (processFile(idx)) touched++;
}

console.log(`escape-mdx-braces: rewrote ${touched} file(s).`);
