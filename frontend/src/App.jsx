import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, CheckCircle, Circle, Loader2, Sun, Moon,
  Calendar, BookOpen, FileText, ListTodo, X, Edit3, Save, RotateCcw, Clock
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

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      if (selectedItem?.id === id) {
        setSelectedItem(null);
        setItemType(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDetail = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
  };

  const closeDetail = () => {
    setSelectedItem(null);
    setItemType(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditTitle(selectedItem.title);
    setEditContent(selectedItem.content);
    setIsEditing(true);
  };

  const handleUpdateNote = async () => {
    if (!editTitle || !editContent) return;
    setSubmitting(true);
    try {
      const res = await axios.patch(`${NOTE_API}/${selectedItem.id}`, {
        title: editTitle,
        content: editContent
      });
      setNotes(prevNotes => prevNotes.map(n => n.id === selectedItem.id ? res.data : n));
      closeDetail();
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui catatan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCountdown = (deadline) => {
    const diff = new Date(deadline) - now;
    if (diff <= 0) return "Waktu Habis";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
    if (hours > 0) return `${hours} Jam ${minutes} Menit ${seconds} Detik`;
    return `${minutes} Menit ${seconds} Detik`;
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
                        onClick={() => openDetail(todo, 'todo')}
                        className={`glass p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 group transition-all cursor-pointer hover:border-accent/40 ${todo.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}
                      >
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id, todo.completed); }}
                            className="text-accent hover:scale-110 transition-transform flex-shrink-0"
                          >
                            {todo.completed ? <CheckCircle size={32} /> : <Circle size={32} />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteItem(todo.id, 'todo'); }}
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
                            {!todo.completed && (
                              <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-tighter ${new Date(todo.deadline) < new Date() ? 'text-red-500' : 'text-accent/60'}`}>
                                <Clock size={14} /> {getCountdown(todo.deadline)}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteItem(todo.id, 'todo'); }}
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
                        onClick={() => openDetail(note, 'note')}
                        className="glass p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-border group relative flex flex-col justify-between cursor-pointer hover:border-accent/40 transition-all"
                      >
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-foreground mb-4 pr-10">{note.title}</h3>
                          <p className="text-muted leading-relaxed whitespace-pre-wrap font-medium text-sm sm:text-base line-clamp-4">{note.content}</p>
                        </div>
                        <div className="flex items-center justify-between mt-8">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted/50">
                            {new Date(note.createdAt).toLocaleDateString('id-ID')}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteItem(note.id, 'note'); }}
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

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDetail}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-lg rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-accent/20">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ duration: 0.5 }}
                  className="h-full bg-accent" 
                />
              </div>

              <button
                onClick={closeDetail}
                className="absolute right-6 top-8 p-2 text-muted hover:text-foreground hover:bg-border/20 rounded-full transition-all"
              >
                <X size={24} />
              </button>

              {itemType === 'todo' ? (
                <div className="space-y-6 pt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
                    Task Details
                  </div>
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{selectedItem.task}</h2>
                  <div className="space-y-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">Course</p>
                        <p className="font-semibold text-foreground text-lg">{selectedItem.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">Deadline</p>
                        <p className="font-semibold text-foreground text-lg">
                          {new Date(selectedItem.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                        </p>
                        {!selectedItem.completed && (
                          <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold uppercase ${new Date(selectedItem.deadline) < new Date() ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}`}>
                            <Clock size={14} /> {getCountdown(selectedItem.deadline)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                        {selectedItem.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">Status</p>
                        <p className={`font-semibold text-lg ${selectedItem.completed ? 'text-green-500' : 'text-amber-500'}`}>
                          {selectedItem.completed ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {isEditing ? (
                    <div className="space-y-6 pt-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
                        Editing Note
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Title</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-border/5 border border-border/20 rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:border-accent/50 text-foreground transition-all"
                            placeholder="Judul catatan..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">Content</label>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-border/5 border border-border/20 rounded-xl px-4 py-4 text-base font-medium focus:outline-none focus:border-accent/50 text-muted min-h-[220px] resize-none custom-scrollbar transition-all"
                            placeholder="Tulis sesuatu..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleUpdateNote}
                          disabled={submitting}
                          className="flex-1 bg-accent text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                          Update Note
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-8 bg-border/10 text-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-border/20 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 pt-4">
                      <div className="flex justify-between items-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest">
                          Note Details
                        </div>
                        <button
                          onClick={startEditing}
                          className="p-2.5 text-accent hover:bg-accent/10 rounded-xl transition-all flex items-center gap-2 text-xs font-bold border border-accent/20 hover:border-accent/40"
                        >
                          <Edit3 size={16} /> EDIT
                        </button>
                      </div>
                      <h2 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">{selectedItem.title}</h2>
                      <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-muted leading-relaxed whitespace-pre-wrap font-medium text-lg italic">
                          "{selectedItem.content}"
                        </p>
                      </div>
                      <div className="pt-6 border-t border-border/40 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">Created At</p>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(selectedItem.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                          </p>
                        </div>
                        {selectedItem.updatedAt && (
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">Last Updated</p>
                            <p className="text-sm font-semibold text-foreground">
                              {new Date(selectedItem.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
