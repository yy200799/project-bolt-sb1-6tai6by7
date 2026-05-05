export interface CourseInfo {
  name: string;
  videoCount: number;
  coverImage?: string;
}

export type TreeNode = File | TreeDir;

export interface TreeDir {
  [key: string]: TreeNode;
}

export type View = 'empty' | 'grid' | 'player';
