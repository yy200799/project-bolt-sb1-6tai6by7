import { useRef, useState, useCallback, useMemo } from 'react';
import { Search } from 'lucide-react';
import Navbar from './components/Navbar';
import EmptyState from './components/EmptyState';
import CourseGrid from './components/CourseGrid';
import TreeSidebar from './components/TreeSidebar';
import CoursePlayer from './components/CoursePlayer';
import SettingsModal from './components/SettingsModal';
import { CourseInfo, TreeDir } from './types';
import { useSettings } from './SettingsContext';

type Tab = 'enrollments' | 'explore';

function buildTree(files: File[], coursePrefix: string): TreeDir {
  const tree: TreeDir = {};
  files
    .filter(f => f.webkitRelativePath.startsWith(coursePrefix + '/') && f.name.match(/\.(mp4|mkv|webm)$/i))
    .forEach(file => {
      const rel = file.webkitRelativePath.substring(coursePrefix.length + 1);
      const parts = rel.split('/');
      let cur: TreeDir = tree;
      parts.forEach((p, i) => {
        if (i === parts.length - 1) {
          cur[p] = file;
        } else {
          if (!cur[p]) cur[p] = {} as TreeDir;
          cur = cur[p] as TreeDir;
        }
      });
    });
  return tree;
}

function flattenVideos(tree: TreeDir): File[] {
  const result: File[] = [];
  const entries = Object.entries(tree).sort(([a, av], [b, bv]) => {
    const aFile = av instanceof File;
    const bFile = bv instanceof File;
    if (aFile !== bFile) return aFile ? 1 : -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });
  for (const [, v] of entries) {
    if (v instanceof File) result.push(v);
    else result.push(...flattenVideos(v as TreeDir));
  }
  return result;
}

function parseCourses(files: File[]): CourseInfo[] {
  const map: Record<string, number> = {};
  files.forEach(file => {
    const parts = file.webkitRelativePath.split('/');
    if (parts.length < 2) return;
    const name = parts[0];
    if (file.name.match(/\.(mp4|mkv|webm)$/i)) {
      map[name] = (map[name] ?? 0) + 1;
    } else if (!(name in map)) {
      map[name] = 0;
    }
  });
  return Object.keys(map)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(name => ({
      name,
      videoCount: map[name],
      coverImage: localStorage.getItem('cover_' + name) ?? undefined,
    }));
}

function loadCompleted(courseName: string): Set<string> {
  try {
    const raw = localStorage.getItem('completed_' + courseName);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(courseName: string, set: Set<string>) {
  localStorage.setItem('completed_' + courseName, JSON.stringify([...set]));
}

export default function App() {
  const [tab, setTab] = useState<Tab>('enrollments');
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [activeTree, setActiveTree] = useState<TreeDir>({});
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [completedFiles, setCompletedFiles] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { setLastFolderPath } = useSettings();

  const view = allFiles.length === 0 ? 'empty' : activeCourse ? 'player' : 'grid';

  const handleFiles = useCallback((files: File[]) => {
    setAllFiles(prev => {
      const merged = [...prev, ...files];
      setCourses(parseCourses(merged));
      return merged;
    });
    if (files.length > 0) {
      const root = files[0].webkitRelativePath.split('/')[0];
      setLastFolderPath(root);
    }
  }, [setLastFolderPath]);

  function handleFolderInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleFiles(files);
    e.target.value = '';
  }

  function handleReloadFolder(files: File[]) {
    setAllFiles([]);
    setCourses([]);
    setActiveCourse(null);
    setActiveFile(null);
    setActiveTree({});
    handleFiles(files);
  }

  function openCourse(name: string) {
    setActiveCourse(name);
    setActiveTree(buildTree(allFiles, name));
    setActiveFile(null);
    setCompletedFiles(loadCompleted(name));
  }

  function handleBack() {
    setActiveCourse(null);
    setActiveFile(null);
    setActiveTree({});
    setSearch('');
  }

  function handleCoverChange(name: string, dataUrl: string) {
    localStorage.setItem('cover_' + name, dataUrl);
    setCourses(prev => prev.map(c => c.name === name ? { ...c, coverImage: dataUrl } : c));
  }

  function handleMarkComplete(fileName: string) {
    if (!activeCourse) return;
    setCompletedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileName)) {
        next.delete(fileName);
      } else {
        next.add(fileName);
      }
      saveCompleted(activeCourse, next);
      return next;
    });
  }

  const flatVideos = activeCourse ? flattenVideos(activeTree) : [];
  const activeIdx = activeFile ? flatVideos.indexOf(activeFile) : -1;

  const progress = useMemo(() => {
    if (!flatVideos.length) return 0;
    const done = flatVideos.filter(f => completedFiles.has(f.name)).length;
    return Math.round((done / flatVideos.length) * 100);
  }, [flatVideos, completedFiles]);

  return (
    <div className="app">
      <Navbar
        activeTab={tab}
        onTabChange={setTab}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {view === 'player' && activeCourse && (
        <div className="course-header-bar">
          <h1 className="course-header-title">{activeCourse}</h1>
          <div className="header-search">
            <Search size={14} className="header-search-icon" />
            <input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="layout">
        {view === 'player' && activeCourse && (
          <TreeSidebar
            courseName={activeCourse}
            tree={activeTree}
            activeFile={activeFile}
            onFileSelect={setActiveFile}
            onBack={handleBack}
            onNext={() => activeIdx < flatVideos.length - 1 && setActiveFile(flatVideos[activeIdx + 1])}
            onPrev={() => activeIdx > 0 && setActiveFile(flatVideos[activeIdx - 1])}
            hasNext={activeIdx < flatVideos.length - 1}
            hasPrev={activeIdx > 0}
            progress={progress}
          />
        )}

        <main className="content">
          {view === 'empty' && (
            <EmptyState onSelect={() => fileRef.current?.click()} />
          )}

          {view === 'grid' && (
            <CourseGrid
              courses={courses}
              onOpen={openCourse}
              onCoverChange={handleCoverChange}
              onAddMore={() => fileRef.current?.click()}
            />
          )}

          {view === 'player' && activeCourse && (
            <CoursePlayer
              activeFile={activeFile}
              allFiles={allFiles}
              courseName={activeCourse}
              onMarkComplete={handleMarkComplete}
              completedFiles={completedFiles}
            />
          )}
        </main>
      </div>

      <input
        ref={fileRef}
        type="file"
        // @ts-expect-error webkitdirectory not in typings
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
        onChange={handleFolderInput}
      />

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onReloadFolder={handleReloadFolder}
        />
      )}
    </div>
  );
}
