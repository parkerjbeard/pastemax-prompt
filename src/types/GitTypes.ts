export interface GitChangedFile {
  absolutePath: string;
  relativePath: string;
  status: string;
  indexStatus?: string;
  worktreeStatus?: string;
  isUntracked: boolean;
  oldRelativePath?: string;
}

export interface GitCommitSummary {
  hash: string;
  subject: string;
  timestamp: number;
  isoDate: string | null;
}

export interface GitCommitFileInfo {
  relativePath: string;
  absolutePath: string;
}

export interface GitCommitBackloadSegment {
  hash: string;
  subject: string;
  timestamp: number | null;
  isoDate: string | null;
  order: number;
  files: GitCommitFileInfo[];
}

export interface GitDiffResult {
  diff: string;
  changedPaths: string[];
  annotatedPaths?: GitDiffPathAnnotation[];
}

export interface GitDiffPathAnnotation {
  absolutePath: string;
  source: 'working-tree' | 'commit';
  commitHash?: string;
  commitOrder?: number;
}
