import { useEffect, useRef, useState } from 'react';
import { Download, BookOpen, PlayCircle } from 'lucide-react';
import CommentsSection from './CommentsSection';

interface CoursePlayerProps {
  activeFile: File | null;
  allFiles: File[];
  courseName: string;
  onMarkComplete: (fileName: string) => void;
  completedFiles: Set<string>;
}

export default function CoursePlayer({
  activeFile, allFiles, courseName, onMarkComplete, completedFiles,
}: CoursePlayerProps) {
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
      <div className="player-outer">
        <div className="player-empty">
          <PlayCircle size={64} strokeWidth={1} />
          <h3>Select a lesson to begin</h3>
          <p>Choose a video from the sidebar menu</p>
        </div>
      </div>
    );
  }

  const title = activeFile.name.replace(/\.[^/.]+$/, '');
  const lessonId = activeFile.webkitRelativePath;
  const isCompleted = completedFiles.has(activeFile.name);

  return (
    <div className="player-outer">
      <div className="player-scroll">
        {/* Branding */}
        <div className="player-branding">
          <div className="player-brand-logo">
            <div className="brand-icon">
              <BookOpen size={22} strokeWidth={2} />
            </div>
            <div className="brand-text">
              <div className="brand-name">SCPC</div>
              <div className="brand-sub">Learning Platform</div>
            </div>
          </div>
          <h2 className="player-lesson-title">{title}</h2>
        </div>

        {/* Video */}
        <div className="video-card">
          <div className="video-wrapper">
            <video ref={videoRef} controls key={videoUrl ?? ''}>
              {videoUrl && <source src={videoUrl} />}
            </video>
          </div>
        </div>

        {/* PDF files */}
        <div className="pdf-section">
          <h3 className="pdf-section-title">Les fichiers PDFs</h3>
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
                    <div className="pdf-download-icon">
                      <Download size={12} />
                    </div>
                    <span>{pdf.name.replace(/\.pdf$/i, '')}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments */}
        <CommentsSection lessonId={lessonId} />
      </div>

      {/* Mark as complete bar */}
      <div className="mark-complete-bar">
        <button
          className={`mark-complete-btn ${isCompleted ? 'completed' : ''}`}
          onClick={() => onMarkComplete(activeFile.name)}
        >
          {isCompleted ? 'Completed' : 'Mark as complete'}
        </button>
      </div>
    </div>
  );
}
