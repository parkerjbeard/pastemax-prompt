import type { FileData } from '../types/FileTypes';
import { normalizePath, basename } from './pathUtils';

const OBJECT_OBJECT_STRING = '[object Object]';

export const toPlainString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    const maybeToString = (value as { toString?: () => string }).toString;
    if (typeof maybeToString === 'function') {
      const result = maybeToString.call(value);
      return result === OBJECT_OBJECT_STRING ? '' : result;
    }
  }
  return '';
};

export const sanitizeIncomingFileData = (input: any): FileData | null => {
  if (!input) {
    return null;
  }

  const rawPath = toPlainString(input.path) || toPlainString(input.absolutePath);
  const normalizedPath = normalizePath(rawPath);

  if (!normalizedPath) {
    console.warn('[sanitizeIncomingFileData] Dropped entry without a usable path', input);
    return null;
  }

  const rawName = toPlainString(input.name);
  const safeName = rawName || basename(normalizedPath);

  const rawRelative = toPlainString(input.relativePath);
  const normalizedRelative = rawRelative ? normalizePath(rawRelative) : undefined;

  const numericTokenCount = Number(input?.tokenCount);
  const tokenCount = Number.isFinite(numericTokenCount) ? numericTokenCount : 0;

  const numericSize = Number(input?.size);
  const size = Number.isFinite(numericSize) ? numericSize : 0;

  const excludedByDefault =
    typeof input?.excludedByDefault === 'boolean'
      ? input.excludedByDefault
      : Boolean(input?.excluded);

  return {
    ...input,
    path: normalizedPath,
    name: safeName,
    relativePath: normalizedRelative,
    tokenCount,
    size,
    isBinary: Boolean(input?.isBinary),
    isSkipped: Boolean(input?.isSkipped),
    content: typeof input?.content === 'string' ? input.content : '',
    excludedByDefault,
  } as FileData;
};

export const sanitizeIncomingFileList = (files: any[]): FileData[] => {
  const sanitized = files
    .map((file) => sanitizeIncomingFileData(file))
    .filter((file): file is FileData => Boolean(file));

  const dropped = files.length - sanitized.length;
  if (dropped > 0) {
    console.warn(
      `[sanitizeIncomingFileList] Dropped ${dropped} invalid file entr${dropped === 1 ? 'y' : 'ies'}`
    );
  }

  return sanitized;
};
