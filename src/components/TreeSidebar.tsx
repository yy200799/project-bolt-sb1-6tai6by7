import { useState } from 'react';
import { ChevronRight, Film, Folder, ArrowLeft } from 'lucide-react';
import { TreeDir, TreeNode } from '../types';

interface TreeSidebarProps {
  courseName: string;
  tree: TreeDir;
  activeFile: File | null;
  onFileSelect: (file: File) => void;
  onBack: () => void;
}

interface TreeItemProps {
  name: string;
  node: TreeNode;
  depth: number;
  activeFile: File | null;
  onFileSelect: (file: File) => void;
}

function TreeItem({ name, node, depth, activeFile, onFileSelect }: TreeItemProps) {
  const [open, setOpen] = useState(depth === 0);

  if (node instanceof File) {
    const label = name.replace(/\.[^/.]+$/, '');
    const isActive = activeFile === node;
    return (
      <button
        className={`tree-file ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onFileSelect(node)}
      >
        <Film size={13} className="tree-icon" />
        <span>{label}</span>
        {isActive && <span className="tree-playing-dot" />}
      </button>
    );
  }

  const dir = node as TreeDir;
  return (
    <div className="tree-folder-group">
      <button
        className={`tree-folder ${open ? 'open' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => setOpen(o => !o)}
      >
        <ChevronRight size={14} className="tree-chevron" />
        <Folder size={14} className="tree-icon" />
        <span>{name}</span>
      </button>
      {open && (
        <div className="tree-children">
          {sortedEntries(dir).map(([k, v]) => (
            <TreeItem key={k} name={k} node={v} depth={depth + 1} activeFile={activeFile} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function sortedEntries(dir: TreeDir): [string, TreeNode][] {
  return Object.entries(dir).sort(([a, av], [b, bv]) => {
    const aFile = av instanceof File;
    const bFile = bv instanceof File;
    if (aFile !== bFile) return aFile ? 1 : -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
}

export default function TreeSidebar({ courseName, tree, activeFile, onFileSelect, onBack }: TreeSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          Dashboard
        </button>
        <h2 className="sidebar-course-name">{courseName}</h2>
      </div>

      <div className="tree-root">
        {sortedEntries(tree).map(([k, v]) => (
          <TreeItem key={k} name={k} node={v} depth={0} activeFile={activeFile} onFileSelect={onFileSelect} />
        ))}
      </div>
    </aside>
  );
}
