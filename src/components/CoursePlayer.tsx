import { useEffect, useRef, useState } from 'react';
import { FileText, ExternalLink, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface CoursePlayerProps {
  activeFile: File | null;
  allFiles: File[];
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function CoursePlayer({ activeFile, allFiles, onNext, onPrev, hasNext, hasPrev }: CoursePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [pdfs, setPdfs] = useState<File[]>([]);

  useEffect(() => {
    if (!activeFile) return;

    const url = URL.createObjectURL(activeFile);
    setVideoUrl(url);

    const dir = activeFile.webkitRelativePath.substring(0, activeFile.webkitRelativePath.lastIndexOf('/'));
    const related = allFiles.filter(
      f => f.name.toLowerCase().endsWith('.pdf') && f.webkitRelativePath.startsWith(dir)
    );
    setPdfs(related);

    return () => URL.revokeObjectURL(url);
  }, [activeFile, allFiles]);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  if (!activeFile) {
    return (
      <div className="player-empty">
        <PlayCircle size={64} strokeWidth={1} />
        <h3>Select a lesson to begin</h3>
        <p>Choose a video from the sidebar menu</p>
      </div>
    );
  }

  const title = activeFile.name.replace(/\.[^/.]+$/, '');

  return (
    <div className="player-view">
      <div className="video-card">
        <div className="video-wrapper">
          <video ref={videoRef} controls key={videoUrl ?? ''}>
            {videoUrl && <source src={videoUrl} />}
          </video>
        </div>

        <div className="video-meta">
          <div className="video-title-row">
            <h2 className="video-title">{title}</h2>
            <div className="video-nav">
              <button className="nav-btn" onClick={onPrev} disabled={!hasPrev} title="Previous lesson">
                <ChevronLeft size={18} />
              </button>
              <button className="nav-btn" onClick={onNext} disabled={!hasNext} title="Next lesson">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="attachments-card">
        <h3 className="attachments-title">
          <FileText size={16} />
          Attachments
          {pdfs.length > 0 && <span className="badge">{pdfs.length}</span>}
        </h3>

        {pdfs.length === 0 ? (
          <p className="no-attachments">No PDF attachments for this lesson.</p>
        ) : (
          <div className="pdf-list">
            {pdfs.map(pdf => {
              const pdfUrl = URL.createObjectURL(pdf);
              return (
                <a
                  key={pdf.name}
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pdf-item"
                  onClick={() => setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000)}
                >
                  <div className="pdf-icon">
                    <FileText size={18} />
                  </div>
                  <span className="pdf-name">{pdf.name}</span>
                  <ExternalLink size={14} className="pdf-open" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
