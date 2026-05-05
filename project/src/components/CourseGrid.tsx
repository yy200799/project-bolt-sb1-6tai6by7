import { PlusCircle } from 'lucide-react';
import CourseCard from './CourseCard';
import { CourseInfo } from '../types';

interface CourseGridProps {
  courses: CourseInfo[];
  onOpen: (name: string) => void;
  onCoverChange: (name: string, dataUrl: string) => void;
  onAddMore: () => void;
}

export default function CourseGrid({ courses, onOpen, onCoverChange, onAddMore }: CourseGridProps) {
  return (
    <div className="grid-view">
      <div className="grid-header">
        <div>
          <h1 className="grid-title">My Courses</h1>
          <p className="grid-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} loaded</p>
        </div>
        <button className="add-more-btn" onClick={onAddMore}>
          <PlusCircle size={16} />
          Load More
        </button>
      </div>

      <div className="course-grid">
        {courses.map(course => (
          <CourseCard
            key={course.name}
            course={course}
            onOpen={onOpen}
            onCoverChange={onCoverChange}
          />
        ))}
      </div>
    </div>
  );
}
