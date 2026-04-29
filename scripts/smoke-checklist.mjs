import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const checklistPath = resolve(process.cwd(), 'scripts', 'smoke-checklist.json');
const content = readFileSync(checklistPath, 'utf8');
const checklist = JSON.parse(content);

console.log('DressFair RN Smoke Checklist');
console.log('============================');
for (const [index, item] of checklist.items.entries()) {
  console.log(`${index + 1}. [ ] ${item}`);
}
console.log('\nUse this checklist before QA handoff and release.');
