import { BookOpen, Compass, User, Settings } from 'lucide-react';

type NavTab = 'enrollments' | 'explore';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSettings: () => void;
}

export default function Navbar({ activeTab, onTabChange, onOpenSettings }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <BookOpen size={22} strokeWidth={2.5} />
        <span>SCPC Platform</span>
      </div>

      <nav className="navbar-tabs">
        <button
          className={`nav-tab ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => onTabChange('enrollments')}
        >
          Enrollments
        </button>
        <button
          className={`nav-tab ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => onTabChange('explore')}
        >
          <Compass size={15} />
          Explore
        </button>
      </nav>

      <div className="navbar-user">
        <button
          className="navbar-settings-btn"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open settings"
        >
          <Settings size={17} />
        </button>
        <div className="user-avatar">
          <User size={16} />
        </div>
        <span>Student</span>
      </div>
    </header>
  );
}
