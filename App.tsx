import React, { useState, useEffect } from 'react';
import { Course, Chapter } from './types';
import { ChapterView } from './components/ChapterView';

// --- LocalStorage Service ---
const storage = {
  getCourses: (): Course[] => {
    try {
      const coursesJson = localStorage.getItem('intelliLearnCourses');
      return coursesJson ? JSON.parse(coursesJson) : [];
    } catch (error) {
      console.error("Failed to parse courses from localStorage", error);
      return [];
    }
  },
  saveCourses: (courses: Course[]) => {
    localStorage.setItem('intelliLearnCourses', JSON.stringify(courses));
  }
};

// --- View Components ---

const DashboardView = ({ courses, onSelectCourse, onCreateCourse, onDeleteCourse }) => {
    const [newCourseName, setNewCourseName] = useState('');
    const cardColors = [
        'from-sky-500 to-indigo-500',
        'from-green-500 to-teal-500',
        'from-purple-500 to-pink-500',
        'from-yellow-500 to-orange-500',
    ];

    const handleCreate = (e) => {
        e.preventDefault();
        if (newCourseName.trim()) {
            onCreateCourse(newCourseName.trim());
            setNewCourseName('');
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-800">My Courses</h2>
            <form onSubmit={handleCreate} className="mb-8 flex gap-4">
                <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Enter a new course name..."
                    className="flex-grow bg-white border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow shadow-inner shadow-slate-200/50"
                />
                <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-sky-500/30">
                    Create Course
                </button>
            </form>
            {courses.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white/50 rounded-lg border border-slate-200">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-slate-800">No courses yet</h3>
                    <p className="mt-1 text-sm text-slate-500">Create a course to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <div key={course.id} className="relative bg-white rounded-xl group transition-all duration-300 ease-in-out overflow-hidden border border-slate-200 hover:shadow-2xl hover:shadow-sky-200/50 hover:-translate-y-1">
                             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cardColors[index % cardColors.length]}`}></div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 truncate">{course.name}</h3>
                                <p className="text-slate-500 text-sm mt-1">{course.chapters.length} {course.chapters.length === 1 ? 'chapter' : 'chapters'}</p>
                                <button onClick={() => onSelectCourse(course.id)} className={`mt-6 w-full text-center bg-gradient-to-r ${cardColors[index % cardColors.length]} text-white font-bold py-2.5 rounded-lg transition-all transform group-hover:scale-105`}>
                                    View Course
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteCourse(course.id); }} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-50 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CourseView = ({ course, onSelectChapter, onCreateChapter, onDeleteChapter, onBack }) => {
    const [newChapterName, setNewChapterName] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (newChapterName.trim()) {
            onCreateChapter(newChapterName.trim());
            setNewChapterName('');
        }
    };
    
    return (
        <div>
            <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 transition-colors font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                Back to Dashboard
            </button>
            <h2 className="text-4xl font-bold mb-2 text-slate-800">{course.name}</h2>
            <p className="text-slate-600 mb-8">Manage chapters for this course.</p>

            <form onSubmit={handleCreate} className="mb-8 flex gap-4">
                <input
                    type="text"
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    placeholder="New chapter name..."
                    className="flex-grow bg-white border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-shadow shadow-inner shadow-slate-200/50"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30">
                    Add Chapter
                </button>
            </form>

            <div className="space-y-3">
                 {course.chapters.length === 0 ? (
                    <div className="text-center py-16 px-6 bg-white/50 rounded-lg border border-slate-200">
                        <svg className="mx-auto h-12 w-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        <h3 className="mt-2 text-lg font-medium text-slate-800">No chapters yet</h3>
                        <p className="mt-1 text-sm text-slate-500">Add a chapter to start learning!</p>
                    </div>
                ) : course.chapters.map((chapter, index) => (
                    <div key={chapter.id} onClick={() => onSelectChapter(chapter.id)} className="flex items-center bg-white border border-slate-200 rounded-lg p-4 group transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer shadow-md">
                        <span className="text-lg font-bold text-slate-400 group-hover:text-emerald-500 transition-colors mr-4">{String(index + 1).padStart(2, '0')}</span>
                        <p className="flex-grow font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">{chapter.name}</p>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteChapter(chapter.id); }} className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main App Component ---

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<'DASHBOARD' | 'COURSE' | 'CHAPTER'>('DASHBOARD');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  useEffect(() => {
    setCourses(storage.getCourses());
  }, []);

  useEffect(() => {
    storage.saveCourses(courses);
  }, [courses]);

  const handleCreateCourse = (name: string) => {
    const newCourse: Course = { id: Date.now().toString(), name, chapters: [] };
    setCourses(prev => [...prev, newCourse]);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course and all its chapters?")) {
        setCourses(prev => prev.filter(c => c.id !== courseId));
    }
  }

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setView('COURSE');
  };

  const handleCreateChapter = (name: string) => {
    const newChapter: Chapter = { id: Date.now().toString(), name, sourceFile: null, summary: null, quiz: null, mangaScript: null, flashcards: null };
    setCourses(prev => prev.map(c => c.id === selectedCourseId ? { ...c, chapters: [...c.chapters, newChapter] } : c));
  };
    
  const handleDeleteChapter = (chapterId: string) => {
    setCourses(prev => prev.map(c => c.id === selectedCourseId ? { ...c, chapters: c.chapters.filter(ch => ch.id !== chapterId) } : c));
  }

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setView('CHAPTER');
  };

  const handleUpdateChapter = (updatedData: Partial<Chapter>) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== selectedCourseId) return c;
      return {
        ...c,
        chapters: c.chapters.map(ch => ch.id === selectedChapterId ? { ...ch, ...updatedData } : ch)
      };
    }));
  };
  
  const backToDashboard = () => {
    setSelectedCourseId(null);
    setSelectedChapterId(null);
    setView('DASHBOARD');
  };
  
  const backToCourse = () => {
      setSelectedChapterId(null);
      setView('COURSE');
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const selectedChapter = selectedCourse?.chapters.find(ch => ch.id === selectedChapterId);

  const renderContent = () => {
    switch(view) {
        case 'CHAPTER':
            return selectedChapter && <ChapterView chapter={selectedChapter} onUpdateChapter={handleUpdateChapter} onBack={backToCourse} />;
        case 'COURSE':
            return selectedCourse && <CourseView course={selectedCourse} onSelectChapter={handleSelectChapter} onCreateChapter={handleCreateChapter} onDeleteChapter={handleDeleteChapter} onBack={backToDashboard} />;
        case 'DASHBOARD':
        default:
            return <DashboardView courses={courses} onSelectCourse={handleSelectCourse} onCreateCourse={handleCreateCourse} onDeleteCourse={handleDeleteCourse} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-700 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600">
          IntelliLearn
        </h1>
        <p className="text-slate-600 mt-2">
          Your personal AI learning companion.
        </p>
      </header>
      <main className="w-full max-w-5xl flex-grow">
        <div className="view-container" key={view}>
            {renderContent()}
        </div>
      </main>
      <footer className="w-full max-w-5xl text-center mt-12 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} IntelliLearn. Powered by Generative AI.</p>
      </footer>
    </div>
  );
}