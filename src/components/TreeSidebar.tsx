import { useState } from 'react';
import { ChevronDown, Folder, User } from 'lucide-react';
import { TreeDir, TreeNode } from '../types';

interface TreeSidebarProps {
  courseName: string;
  tree: TreeDir;
  activeFile: File | null;
  onFileSelect: (file: File) => void;
  onBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  progress: number;
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
        className={`tree-chapter-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${28 + depth * 14}px` }}
        onClick={() => onFileSelect(node)}
      >
        <span className="chapter-circle">
          <span className="chapter-circle-inner" />
        </span>
        <span className="chapter-text">{label}</span>
        {isActive && <span className="tree-playing-dot" />}
      </button>
    );
  }

  const dir = node as TreeDir;
  return (
    <div className="tree-folder-group">
      <button
        className={`tree-folder ${open ? 'open' : ''}`}
        style={{ paddingLeft: `${16 + depth * 14}px` }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? <ChevronDown size={13} className="tree-chevron" /> : <ChevronDown size={13} className="tree-chevron" style={{ transform: 'rotate(-90deg)' }} />}
        <Folder size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
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

export default function TreeSidebar({
  courseName, tree, activeFile, onFileSelect, onBack,
  onNext, onPrev, hasNext, hasPrev, progress,
}: TreeSidebarProps) {
  const [sectionOpen, setSectionOpen] = useState(true);

  return (
    <aside className="sidebar">
      <div className="sidebar-instructor">
        <div className="instructor-avatar">
          <User size={36} />
        </div>
        <span className="instructor-name">{courseName}</span>

        <div className="sidebar-nav-buttons">
          <button
            className="sidebar-prev-btn"
            onClick={onPrev}
            disabled={!hasPrev}
          >
            Previous
          </button>
          <button
            className="sidebar-next-btn"
            onClick={onNext}
            disabled={!hasNext}
          >
            Next
          </button>
        </div>

        <div className="sidebar-progress-bar">
          <div className="sidebar-progress-fill" style={{ width: `${progress}%` }} />
          <span className="sidebar-progress-label">{progress}%</span>
        </div>
      </div>

      <div className="tree-root">
        <div className="tree-course-section">
          <button
            className="tree-course-toggle"
            onClick={() => setSectionOpen(o => !o)}
          >
            {sectionOpen ? <ChevronDown size={14} /> : <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />}
            {courseName}
          </button>

          {sectionOpen && (
            <div className="tree-chapter-list">
              {sortedEntries(tree).map(([k, v]) => (
                <TreeItem
                  key={k}
                  name={k}
                  node={v}
                  depth={0}
                  activeFile={activeFile}
                  onFileSelect={onFileSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: 'var(--blue)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Back to Courses
        </button>
      </div>
    </aside>
  );
}
