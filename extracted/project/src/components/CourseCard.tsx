import { useRef } from 'react';
import { PlayCircle, Camera, Video } from 'lucide-react';
import { CourseInfo } from '../types';

interface CourseCardProps {
  course: CourseInfo;
  onOpen: (name: string) => void;
  onCoverChange: (name: string, dataUrl: string) => void;
}

export default function CourseCard({ course, onOpen, onCoverChange }: CourseCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) onCoverChange(course.name, ev.target.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const coverSrc = course.coverImage;

  return (
    <div className="course-card">
      <div className="course-cover" onClick={() => fileRef.current?.click()}>
        {coverSrc ? (
          <img src={coverSrc} alt={course.name} />
        ) : (
          <div className="course-cover-placeholder">
            <span>{course.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        <div className="course-cover-overlay">
          <Camera size={20} />
          <span>Change Cover</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImgChange}
        />
      </div>

      <div className="course-body">
        <h3 className="course-title">{course.name}</h3>

        <div className="course-meta">
          <Video size={14} />
          <span>{course.videoCount} lessons</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '5%' }} />
        </div>

        <div className="course-footer">
          <span className="progress-label">0% complete</span>
          <button className="study-btn" onClick={() => onOpen(course.name)}>
            <PlayCircle size={16} />
            Study
          </button>
        </div>
      </div>
    </div>
  );
}
