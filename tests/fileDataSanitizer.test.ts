import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { sanitizeIncomingFileData, sanitizeIncomingFileList } from '../src/utils/fileDataSanitizer';

test('sanitizeIncomingFileData derives filename from path when name is non-string', () => {
  const raw = {
    name: { unexpected: true },
    path: '/repo/src/example.ts',
    size: '42',
    tokenCount: '10',
    isBinary: 0,
    isSkipped: 0,
    excluded: true,
    content: 123,
  };

  const sanitized = sanitizeIncomingFileData(raw);
  assert.ok(sanitized, 'Expected sanitized file');
  assert.equal(sanitized?.name, 'example.ts');
  assert.equal(sanitized?.path, '/repo/src/example.ts');
  assert.equal(sanitized?.size, 42);
  assert.equal(sanitized?.tokenCount, 10);
  assert.equal(sanitized?.isBinary, false);
  assert.equal(sanitized?.isSkipped, false);
  assert.equal(sanitized?.content, '');
  assert.equal(sanitized?.excludedByDefault, true);
});

test('sanitizeIncomingFileData normalizes relative paths and keeps provided name', () => {
  const raw = {
    name: 'README.md',
    path: '/repo/README.md',
    relativePath: { toString: () => '.\\README.md' },
    size: 12,
    tokenCount: 3,
    isBinary: false,
    isSkipped: false,
    content: 'hello',
    excludedByDefault: false,
  };

  const sanitized = sanitizeIncomingFileData(raw);
  assert.ok(sanitized, 'Expected sanitized file');
  assert.equal(sanitized?.name, 'README.md');
  assert.equal(sanitized?.relativePath, './README.md'.replace(/\\/g, '/'));
  assert.equal(sanitized?.content, 'hello');
});

test('sanitizeIncomingFileList filters entries without usable paths', () => {
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warnings.push(args.map((arg) => String(arg)).join(' '));
  };

  try {
    const sanitized = sanitizeIncomingFileList([
      { name: 'valid.ts', path: '/repo/valid.ts', size: 1, tokenCount: 1, isBinary: false, isSkipped: false, content: '' },
      { name: 'missing-path' },
    ]);

    assert.equal(sanitized.length, 1);
    assert.equal(sanitized[0]?.path, '/repo/valid.ts');
    assert.ok(warnings.some((entry) => entry.includes('Dropped 1 invalid file entry')));
  } finally {
    console.warn = originalWarn;
  }
});
