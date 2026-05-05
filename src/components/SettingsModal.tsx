import { useRef, useState } from 'react';
import { X, FolderOpen, RotateCcw, Palette, FolderSearch } from 'lucide-react';
import { useSettings, ColorTheme, DEFAULT_THEME } from '../SettingsContext';

interface Props {
  onClose: () => void;
  onReloadFolder: (files: File[]) => void;
}

const COLOR_FIELDS: { key: keyof ColorTheme; label: string; hint: string }[] = [
  { key: 'primary',      label: 'Primary',       hint: 'Buttons, active states' },
  { key: 'primaryLight', label: 'Primary Light',  hint: 'Hover accents' },
  { key: 'primaryPale',  label: 'Primary Pale',   hint: 'Subtle backgrounds' },
  { key: 'navy',         label: 'Navbar',         hint: 'Top navigation bar' },
  { key: 'navyMid',      label: 'Navbar Mid',     hint: 'Card placeholder bg' },
  { key: 'navySoft',     label: 'Navbar Soft',    hint: 'Sidebar folder text' },
  { key: 'accent',       label: 'Accent',         hint: 'Progress gradient end' },
];

export default function SettingsModal({ onClose, onReloadFolder }: Props) {
  const { settings, setLastFolderPath, setTheme, resetTheme } = useSettings();
  const [draft, setDraft] = useState<ColorTheme>({ ...settings.theme });
  const folderRef = useRef<HTMLInputElement>(null);

  function handleColorChange(key: keyof ColorTheme, value: string) {
    const updated = { ...draft, [key]: value };
    setDraft(updated);
    setTheme(updated);
  }

  function handleReset() {
    setDraft({ ...DEFAULT_THEME });
    resetTheme();
  }

  function handleFolderInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const root = files[0].webkitRelativePath.split('/')[0];
    setLastFolderPath(root);
    onReloadFolder(files);
    e.target.value = '';
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Settings">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <Palette size={18} />
            <h2>Settings</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Folder Path Section */}
          <section className="settings-section">
            <h3 className="settings-section-title">
              <FolderOpen size={15} />
              Course Folder
            </h3>
            <div className="folder-path-display">
              <FolderSearch size={16} className="folder-path-icon" />
              <span className="folder-path-text">
                {settings.lastFolderPath || 'No folder selected yet'}
              </span>
            </div>
            <button
              className="settings-btn settings-btn-outline"
              onClick={() => folderRef.current?.click()}
            >
              <FolderOpen size={15} />
              {settings.lastFolderPath ? 'Change Folder' : 'Select Folder'}
            </button>
            <input
              ref={folderRef}
              type="file"
              // @ts-expect-error webkitdirectory not in typings
              webkitdirectory=""
              directory=""
              multiple
              style={{ display: 'none' }}
              onChange={handleFolderInput}
            />
            {settings.lastFolderPath && (
              <p className="settings-hint">
                Last loaded: <strong>{settings.lastFolderPath}</strong>
              </p>
            )}
          </section>

          {/* Color Theme Section */}
          <section className="settings-section">
            <div className="settings-section-header">
              <h3 className="settings-section-title">
                <Palette size={15} />
                Color Theme
              </h3>
              <button
                className="settings-btn-ghost"
                onClick={handleReset}
                title="Reset to defaults"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            <div className="color-grid">
              {COLOR_FIELDS.map(({ key, label, hint }) => (
                <div key={key} className="color-row">
                  <label className="color-label">
                    <span className="color-label-name">{label}</span>
                    <span className="color-label-hint">{hint}</span>
                  </label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      value={draft[key]}
                      onChange={e => handleColorChange(key, e.target.value)}
                      className="color-swatch"
                      title={label}
                    />
                    <input
                      type="text"
                      value={draft[key]}
                      onChange={e => {
                        const v = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) handleColorChange(key, v);
                      }}
                      className="color-hex-input"
                      maxLength={7}
                      spellCheck={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
