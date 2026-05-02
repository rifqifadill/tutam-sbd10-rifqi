import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, CheckCircle, Circle, Loader2, Sun, Moon,
  Calendar, BookOpen, FileText, ListTodo
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '');
const TODO_API = `${API_BASE_URL}/api/todos`;
const NOTE_API = `${API_BASE_URL}/api/notes`;

function App() {
  const [activeTab, setActiveTab] = useState('todos');
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [course, setCourse] = useState('');
  const [deadline, setDeadline] = useState('');

  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'todos') {
        const res = await axios.get(TODO_API);
        setTodos(res.data);
      } else {
        const res = await axios.get(NOTE_API);
        setNotes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!task || !course || !deadline) return;
    setSubmitting(true);
    try {
      const res = await axios.post(TODO_API, { task, course, deadline });
      setTodos([...todos, res.data].sort((a, b) => new Date(a.deadline) - new Date(b.deadline)));
      setTask('');
      setCourse('');
      setDeadline('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle || !noteContent) return;
    setSubmitting(true);
    try {
      const res = await axios.post(NOTE_API, { title: noteTitle, content: noteContent });
      setNotes([res.data, ...notes]);
      setNoteTitle('');
      setNoteContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      await axios.patch(`${TODO_API}/${id}`, { completed: !completed });
      setTodos(todos.map(t => t.id === id ? { ...t, completed: !completed } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id, type) => {
    try {
      const api = type === 'todo' ? TODO_API : NOTE_API;
      await axios.delete(`${api}/${id}`);
      if (type === 'todo') {
        setTodos(todos.filter(t => t.id !== id));
      } else {
        setNotes(notes.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col min-h-[85vh]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent/20 rounded-3xl">
              {activeTab === 'todos' ? <ListTodo className="text-accent" size={32} /> : <FileText className="text-accent" size={32} />}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-foreground uppercase">TASK & NOTES</h1>
              <p className="text-muted font-medium italic text-sm sm:text-base">Kelola Tugas dan Catatan jadi mudah dan rapi.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-glass p-1.5 rounded-2xl border border-border w-full md:w-auto justify-center md:justify-start">
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'todos' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-muted hover:text-foreground'}`}
            >
              <ListTodo size={18} /> <span className="sm:inline">Task</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'notes' ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-muted hover:text-foreground'}`}
            >
              <FileText size={18} /> <span className="sm:inline">Notes</span>
            </button>
            <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 text-muted hover:text-foreground transition-colors flex-shrink-0"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'todos' ? (
            <motion.div
              key="todos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1"
            >
              <form onSubmit={handleAddTodo} className="glass rounded-3xl p-6 sm:p-8 mb-12 border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Tugas</label>
                    <input
                      type="text"
                      placeholder="Contoh: Laporan Praktikum"
                      className="w-full bg-transparent border-none text-xl font-semibold focus:outline-none placeholder:text-muted/30 text-foreground"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Mata Kuliah</label>
                    <div className="flex items-center gap-3">
                      <BookOpen size={20} className="text-accent" />
                      <input
                        type="text"
                        placeholder="Nama Matkul"
                        className="w-full bg-transparent border-none text-xl font-semibold focus:outline-none placeholder:text-muted/30 text-foreground"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mt-10 border-t border-border/40 pt-8">
                  <div className="space-y-3 w-full md:w-auto">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Tenggat Waktu (Deadline)</label>
                    <div className="flex items-center gap-3 w-full">
                      <Calendar size={20} className="text-accent" />
                      <div className="relative flex-1">
                        <input
                          type="datetime-local"
                          className="bg-transparent border-none text-lg font-semibold focus:outline-none text-foreground w-full pr-10"
                          style={{ colorScheme: isDark ? 'dark' : 'light' }}
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                        />
                        <Calendar
                          size={18}
                          className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-foreground opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full md:w-auto bg-accent hover:brightness-110 px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-tighter flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-white shadow-xl shadow-accent/25"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={22} />}
                    Simpan Tugas
                  </motion.button>
                </div>
              </form>

              {loading ? (
                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-accent" size={48} /></div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  <AnimatePresence mode='popLayout'>
                    {todos.map((todo) => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`glass p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group transition-all ${todo.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                      >
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <button
                            onClick={() => toggleTodo(todo.id, todo.completed)}
                            className="text-accent hover:scale-110 transition-transform flex-shrink-0"
                          >
                            {todo.completed ? <CheckCircle size={32} /> : <Circle size={32} />}
                          </button>
                          <button
                            onClick={() => deleteItem(todo.id, 'todo')}
                            className="sm:hidden p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 size={22} />
                          </button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xl font-extrabold tracking-tight truncate ${todo.completed ? 'line-through text-muted font-normal' : 'text-foreground'}`}>
                            {todo.task}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                            <span className="flex items-center gap-2 text-sm font-medium text-muted/80">
                              <BookOpen size={16} className="text-accent/60" /> {todo.course}
                            </span>
                            <span className={`flex items-center gap-2 text-sm font-semibold ${new Date(todo.deadline) < new Date() && !todo.completed ? 'text-red-500' : 'text-accent'}`}>
                              <Calendar size={16} /> {new Date(todo.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteItem(todo.id, 'todo')}
                          className="hidden sm:block p-3 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-xl"
                        >
                          <Trash2 size={22} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {!loading && todos.length === 0 && (
                <div className="text-center py-24 opacity-60">
                  <p className="text-muted text-xl font-semibold italic">Tugas Sudah Selesai, Chill dulu Yagesya.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1"
            >
              <form onSubmit={handleAddNote} className="glass rounded-3xl p-6 sm:p-8 mb-12 border border-border">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Judul Catatan</label>
                    <input
                      type="text"
                      placeholder="Isi judul..."
                      className="w-full bg-transparent border-none text-2xl font-bold tracking-tight focus:outline-none placeholder:text-muted/30 text-foreground"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Isi Catatan</label>
                    <textarea
                      placeholder="Tulis apapun di sini..."
                      className="w-full bg-transparent border-none text-lg font-medium focus:outline-none resize-none placeholder:text-muted/30 text-muted min-h-[120px] sm:min-h-[160px]"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end mt-8 border-t border-border/40 pt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full md:w-auto bg-accent hover:brightness-110 px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-tighter flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-white shadow-xl shadow-accent/25"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={22} />}
                    Simpan Catatan
                  </motion.button>
                </div>
              </form>

              {loading ? (
                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-accent" size={48} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <AnimatePresence mode='popLayout'>
                    {notes.map((note) => (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="glass p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-border group relative flex flex-col justify-between"
                      >
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-foreground mb-4 pr-10">{note.title}</h3>
                          <p className="text-muted leading-relaxed whitespace-pre-wrap font-medium text-sm sm:text-base">{note.content}</p>
                        </div>
                        <div className="flex items-center justify-between mt-8">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted/50">
                            {new Date(note.createdAt).toLocaleDateString('id-ID')}
                          </span>
                          <button
                            onClick={() => deleteItem(note.id, 'note')}
                            className="p-3 text-muted hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-500/10 rounded-xl"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {!loading && notes.length === 0 && (
                <div className="text-center py-24 opacity-60">
                  <p className="text-muted text-xl font-semibold italic">Belum ada catatan. Ayok mulai tulis sesuatu!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-auto pt-12 pb-6 text-center">
          <p className="text-[10px] sm:text-xs font-medium text-muted/50 tracking-[0.2em] uppercase px-4">
            © {new Date().getFullYear()} Task & Notes • Made with passion by Muhamad Rifqi Fadil Itsnain
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
