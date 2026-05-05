import { FolderOpen, ArrowUpFromLine } from 'lucide-react';

interface EmptyStateProps {
  onSelect: () => void;
}

export default function EmptyState({ onSelect }: EmptyStateProps) {
  return (
    <div className="empty-state-wrapper">
      <div className="empty-state-card" onClick={onSelect} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect()}>
        <div className="empty-icon-ring">
          <FolderOpen size={48} strokeWidth={1.5} />
        </div>
        <h2>Load Your Course Folder</h2>
        <p>Select a folder containing your video lessons and PDF materials. The app will organize them automatically.</p>
        <div className="empty-cta">
          <ArrowUpFromLine size={16} />
          Browse Folder
        </div>
      </div>

      <div className="empty-hints">
        <div className="hint-item">
          <span className="hint-dot" />
          Supports MP4, MKV, WebM video formats
        </div>
        <div className="hint-item">
          <span className="hint-dot" />
          PDF attachments auto-linked per lesson
        </div>
        <div className="hint-item">
          <span className="hint-dot" />
          Folder structure becomes course menu
        </div>
      </div>
    </div>
  );
}
