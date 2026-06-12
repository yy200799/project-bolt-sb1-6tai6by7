import { GraduationCap, Bell, ChevronDown, Settings } from 'lucide-react';
import { useSettings } from '../SettingsContext';

type NavTab = 'enrollments' | 'explore';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSettings: () => void;
}

export default function Navbar({ activeTab, onTabChange, onOpenSettings }: NavbarProps) {
  const { settings } = useSettings();

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <span>M</span>
      </div>

      <nav className="navbar-tabs">
        <button
          className={`nav-tab ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => onTabChange('enrollments')}
        >
          <GraduationCap size={15} />
          Courses
        </button>
      </nav>

      <div className="navbar-actions">
        <button className="navbar-settings-btn" onClick={onOpenSettings} title="Settings" aria-label="Open settings">
          <Settings size={16} />
        </button>

        <button className="navbar-icon-btn" title="Notifications">
          <Bell size={17} />
        </button>

        <div className="navbar-divider" />

        <div className="navbar-user">
          <div className="user-avatar">
            <span>{settings.lastFolderPath ? settings.lastFolderPath.charAt(0).toUpperCase() : 'S'}</span>
          </div>
          <ChevronDown size={13} />
        </div>

        <div className="navbar-lang">
          EN
          <ChevronDown size={12} />
        </div>
      </div>
    </header>
  );
}
