import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, Loader2, Sun, Moon, Calendar, BookOpen, FileText, ListTodo, X, Edit3, Save, Clock, LogOut, User as UserIcon, Lock, Mail, Sparkles, Leaf } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TODO_API = `${API_BASE_URL}/api/todos`, NOTE_API = `${API_BASE_URL}/api/notes`, AUTH_API = `${API_BASE_URL}/api/auth`;

const AuthView = memo(({ onLogin, onRegister, submitting }) => {
  const [isLoginView, setIsLoginView] = useState(true), [email, setEmail] = useState(''), [pass, setPass] = useState(''), [name, setName] = useState('');
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Leaf size={120} /></div>
      <div className="text-center mb-10 relative">
        <div className="w-20 h-20 bg-accent/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-accent/20"><UserIcon className="text-accent" size={40} /></div>
        <h1 className="text-3xl font-black uppercase mb-2 leading-none">Task & Notes</h1><p className="text-muted italic text-sm">{isLoginView ? 'Selamat datang kembali!' : 'Ayo buat akun barumu!'}</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); isLoginView ? onLogin(email, pass) : onRegister(email, pass, name); }} className="space-y-5">
        {!isLoginView && <AuthInput label="Nama Lengkap" icon={<UserIcon size={18} />} type="text" value={name} onChange={setName} placeholder="Rifqi Fadil" />}
        <AuthInput label="Email Address" icon={<Mail size={18} />} type="email" value={email} onChange={setEmail} placeholder="name@example.com" />
        <AuthInput label="Password" icon={<Lock size={18} />} type="password" value={pass} onChange={setPass} placeholder="••••••••" />
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-accent text-white py-3 rounded-2xl font-bold uppercase tracking-widest shadow-xl mt-4 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">{submitting ? <Loader2 className="animate-spin" size={20} /> : (isLoginView ? 'Log In' : 'Sign Up')}</motion.button>
      </form>
      <div className="mt-8 pt-8 border-t border-border/40 text-center"><p className="text-sm font-medium text-muted mb-2">{isLoginView ? 'Belum punya akun?' : 'Sudah punya akun?'}</p><button onClick={() => setIsLoginView(!isLoginView)} className="text-accent font-bold hover:underline">{isLoginView ? 'Daftar Sekarang' : 'Masuk ke Akun'}</button></div>
    </motion.div>
  );
});

const AuthInput = ({ label, icon, type, value, onChange, placeholder }) => (
  <div className="space-y-2"><label className="text-[10px] font-bold text-muted/50 uppercase tracking-widest ml-1">{label}</label><div className="relative"><div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40">{icon}</div><input type={type} required value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-border/5 border border-border/20 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-accent/50 text-foreground transition-all" placeholder={placeholder} /></div></div>
);

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')), [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('todos'), [isDark, setIsDark] = useState(true), [loading, setLoading] = useState(true), [submitting, setSubmitting] = useState(false);
  const [todos, setTodos] = useState([]), [task, setTask] = useState(''), [course, setCourse] = useState(''), [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState([]), [noteTitle, setNoteTitle] = useState(''), [noteContent, setNoteContent] = useState('');
  const [selectedItem, setSelectedItem] = useState(null), [itemType, setItemType] = useState(null), [isEditing, setIsEditing] = useState(false), [editTitle, setEditTitle] = useState(''), [editContent, setEditContent] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => { if (token) { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); } }, [token]);
  useEffect(() => { if (token) { axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; fetchData(); } else { setLoading(false); } }, [token, activeTab]);
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);

  const fetchData = async () => {
    if (!token) return; setLoading(true);
    try { const res = await axios.get(activeTab === 'todos' ? TODO_API : NOTE_API); if (activeTab === 'todos') setTodos(res.data); else setNotes(res.data); }
    catch (err) { if (err.response?.status === 401 || err.response?.status === 403) handleLogout(); } finally { setLoading(false); }
  };

  const handleLogin = async (email, password) => {
    setSubmitting(true);
    try { const res = await axios.post(`${AUTH_API}/login`, { email, password }); const { token, user } = res.data; setToken(token); setUser(user); localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; }
    catch (err) { alert(err.response?.data?.error || 'Login gagal. Cek koneksi.'); } finally { setSubmitting(false); }
  };

  const handleRegister = async (email, password, name) => {
    setSubmitting(true);
    try { await axios.post(`${AUTH_API}/register`, { email, password, name }); alert('Registrasi berhasil! Silakan login.'); }
    catch (err) { alert(err.response?.data?.error || 'Registrasi gagal. Cek database.'); } finally { setSubmitting(false); }
  };

  const handleLogout = () => { setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); delete axios.defaults.headers.common['Authorization']; };

  const handleAddTodo = async (e) => {
    e.preventDefault(); if (!task || !course || !deadline) return; setSubmitting(true);
    try { const res = await axios.post(TODO_API, { task, course, deadline }); setTodos([...todos, res.data].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))); setTask(''); setCourse(''); setDeadline(''); }
    catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault(); if (!noteTitle || !noteContent) return; setSubmitting(true);
    try { const res = await axios.post(NOTE_API, { title: noteTitle, content: noteContent }); setNotes([res.data, ...notes]); setNoteTitle(''); setNoteContent(''); }
    catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const toggleTodo = async (id, completed) => { try { await axios.patch(`${TODO_API}/${id}`, { completed: !completed }); setTodos(todos.map(t => t.id === id ? { ...t, completed: !completed } : t)); } catch (err) { console.error(err); } };
  const deleteItem = async (id, type) => { try { await axios.delete(`${type === 'todo' ? TODO_API : NOTE_API}/${id}`); if (type === 'todo') setTodos(todos.filter(t => t.id !== id)); else setNotes(notes.filter(n => n.id !== id)); if (selectedItem?.id === id) closeDetail(); } catch (err) { console.error(err); } };
  const openDetail = (item, type) => { setSelectedItem(item); setItemType(type); };
  const closeDetail = () => { setSelectedItem(null); setItemType(null); setIsEditing(false); };
  const startEditing = () => { setEditTitle(selectedItem.title); setEditContent(selectedItem.content); setIsEditing(true); };

  const handleUpdateNote = async () => {
    if (!editTitle || !editContent) return; setSubmitting(true);
    try { const res = await axios.patch(`${NOTE_API}/${selectedItem.id}`, { title: editTitle, content: editContent }); setNotes(notes.map(n => n.id === selectedItem.id ? res.data : n)); closeDetail(); }
    catch (err) { alert('Gagal memperbarui catatan.'); } finally { setSubmitting(false); }
  };

  const getCountdown = (deadline) => {
    const diff = new Date(deadline) - now; if (diff <= 0) return "Waktu Habis";
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    return (d > 0 ? `${d} Hari ` : '') + (h > 0 ? `${h} Jam ` : '') + `${m} Menit ${s} Detik`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-12 relative overflow-hidden bg-pattern">
      <div className="noise-overlay" />
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[5%] w-[40vw] h-[40vw] bg-accent/5 blur-[120px] rounded-full" />
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[10%] -right-[5%] w-[35vw] h-[35vw] bg-accent/10 blur-[100px] rounded-full" />
        <div className="absolute top-[15%] left-[10%] opacity-[0.03] text-accent"><Leaf size={180} className="rotate-[15deg]" /></div>
        <div className="absolute bottom-[10%] right-[15%] opacity-[0.03] text-accent"><Leaf size={240} className="rotate-[-20deg] scale-x-[-1]" /></div>
      </div>
      <div className="max-w-4xl mx-auto flex flex-col min-h-[85vh] relative z-10">
        {!token ? (
          <div className="flex-1 flex items-center justify-center">
            <AuthView onLogin={handleLogin} onRegister={handleRegister} submitting={submitting} />
          </div>
        ) : (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-accent/20 rounded-3xl shadow-lg relative"><div className="absolute -top-1 -right-1 text-accent opacity-30 animate-pulse"><Sparkles size={16} /></div>{activeTab === 'todos' ? <ListTodo className="text-accent" size={32} /> : <FileText className="text-accent" size={32} />}</div>
                <div><div className="flex items-center gap-2 mb-1"><span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-widest shadow-lg"><Sparkles size={10} /> {now.getHours() < 12 ? "Selamat Pagi" : now.getHours() < 18 ? "Selamat Siang" : "Selamat Malam"}, {user?.name?.split(' ')[0]}</span></div><h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase leading-none">TASK & NOTES</h1></div>
              </div>
              <div className="flex items-center gap-2 bg-glass p-1.5 rounded-2xl border border-border w-full md:w-auto justify-center shadow-xl">
                <button onClick={() => setActiveTab('todos')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all ${activeTab === 'todos' ? 'bg-accent text-white shadow-lg' : 'text-muted'}`}><ListTodo size={18} /> <span>Task</span></button>
                <button onClick={() => setActiveTab('notes')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all ${activeTab === 'notes' ? 'bg-accent text-white shadow-lg' : 'text-muted'}`}><FileText size={18} /> <span>Notes</span></button>
                <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>
                <button onClick={() => setIsDark(!isDark)} className="p-2.5 text-muted hover:text-foreground">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
                <button onClick={handleLogout} className="p-2.5 text-muted hover:text-red-500"><LogOut size={20} /></button>
              </div>
            </header>
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-muted/40 animate-pulse"><Loader2 className="animate-spin mb-4" size={48} /><p className="font-bold tracking-widest text-[10px] uppercase">Memuat Data...</p></div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'todos' ? (
                  <motion.div key="todos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                    <form onSubmit={handleAddTodo} className="glass rounded-3xl p-6 sm:p-8 mb-12 border border-border relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700"><Leaf size={140} /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-3"><label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Tugas</label><input type="text" placeholder="Laporan Praktikum" className="w-full bg-transparent border-none text-xl font-semibold focus:outline-none placeholder:text-muted/30 text-foreground" value={task} onChange={(e) => setTask(e.target.value)} /></div>
                        <div className="space-y-3"><label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Mata Kuliah</label><div className="flex items-center gap-3"><BookOpen size={20} className="text-accent" /><input type="text" placeholder="Nama Matkul" className="w-full bg-transparent border-none text-xl font-semibold focus:outline-none placeholder:text-muted/30 text-foreground" value={course} onChange={(e) => setCourse(e.target.value)} /></div></div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-10 border-t border-border/40 pt-8">
                        <div className="space-y-3 w-full md:w-auto"><label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Deadline</label><div className="flex items-center gap-3 relative"><Calendar size={20} className="text-accent" /><input type="datetime-local" className="bg-transparent border-none text-lg font-semibold focus:outline-none text-foreground w-full" style={{ colorScheme: isDark ? 'dark' : 'light' }} value={deadline} onChange={(e) => setDeadline(e.target.value)} /><Calendar size={18} className="absolute right-1 pointer-events-none text-foreground opacity-60" /></div></div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-accent px-8 py-3 rounded-2xl font-bold uppercase tracking-tighter flex items-center justify-center gap-2 text-white shadow-xl disabled:opacity-50 transition-all" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={22} />} Simpan Tugas</motion.button>
                      </div>
                    </form>
                    <div className="space-y-4">
                      {todos.map((todo) => (
                        <motion.div key={todo.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => openDetail(todo, 'todo')} className={`glass p-5 sm:p-6 rounded-[2rem] border border-border flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group cursor-pointer ${todo.completed ? 'opacity-50 grayscale' : 'hover:shadow-xl'}`}>
                          <button onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id, todo.completed); }} className="text-accent">{todo.completed ? <CheckCircle size={32} /> : <Circle size={32} />}</button>
                          <div className="flex-1 min-w-0"><h3 className={`text-xl font-extrabold tracking-tight truncate ${todo.completed ? 'line-through text-muted font-normal' : ''}`}>{todo.task}</h3><div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2"><span className="flex items-center gap-2 text-sm font-medium text-muted/80"><BookOpen size={16} className="text-accent/60" /> {todo.course}</span><span className="flex items-center gap-2 text-sm font-semibold text-accent"><Calendar size={16} /> {new Date(todo.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>{!todo.completed && <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-accent/60"><Clock size={14} /> {getCountdown(todo.deadline)}</span>}</div></div>
                          <button onClick={(e) => { e.stopPropagation(); deleteItem(todo.id, 'todo'); }} className="p-3 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={22} /></button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1">
                    <form onSubmit={handleAddNote} className="glass rounded-3xl p-6 sm:p-8 mb-12 border border-border relative overflow-hidden group">
                      <div className="space-y-6">
                        <div className="space-y-3"><label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Judul Catatan</label><input type="text" placeholder="Isi judul..." className="w-full bg-transparent border-none text-2xl font-bold focus:outline-none placeholder:text-muted/30 text-foreground" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} /></div>
                        <div className="space-y-3"><label className="text-[11px] font-semibold uppercase tracking-widest text-muted/80 ml-1">Isi Catatan</label><textarea placeholder="Tulis apapun di sini..." className="w-full bg-transparent border-none text-lg font-medium focus:outline-none resize-none placeholder:text-muted/30 text-muted min-h-[160px]" value={noteContent} onChange={(e) => setNoteContent(e.target.value)}></textarea></div>
                      </div>
                      <div className="flex justify-end mt-8 border-t border-border/40 pt-8"><button className="bg-accent px-8 py-3 rounded-2xl font-bold uppercase tracking-tighter flex items-center justify-center gap-2 text-white shadow-xl disabled:opacity-50" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={22} />} Simpan Catatan</button></div>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {notes.map((note) => (
                        <motion.div key={note.id} layout onClick={() => openDetail(note, 'note')} className="glass p-6 sm:p-8 rounded-[2.5rem] border border-border group relative flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all">
                          <div><h3 className="text-xl font-extrabold tracking-tight mb-4 pr-10">{note.title}</h3><p className="text-muted leading-relaxed font-medium text-sm line-clamp-4 whitespace-pre-wrap">{note.content}</p></div>
                          <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-border/40"><span className="text-[10px] font-semibold uppercase tracking-widest text-muted/50">{new Date(note.createdAt).toLocaleDateString('id-ID')}</span><button onClick={(e) => { e.stopPropagation(); deleteItem(note.id, 'note'); }} className="p-3 text-muted hover:text-red-500 w-fit"><Trash2 size={20} /></button></div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <footer className="mt-auto pt-12 pb-6 text-center text-[10px] font-medium text-muted/50 tracking-widest uppercase">© {new Date().getFullYear()} Task & Notes • Muhamad Rifqi Fadil Itsnain</footer>
          </>
        )}
      </div>
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDetail} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="glass w-full max-w-lg rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent/20"><motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-accent" /></div>
              <button onClick={closeDetail} className="absolute right-6 top-8 p-2 text-muted hover:text-foreground z-10"><X size={24} /></button>
              {itemType === 'todo' ? (
                <div className="space-y-6 pt-4"><span className="inline-flex px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest w-fit">Task Details</span><h2 className="text-3xl font-extrabold tracking-tight">{selectedItem.task}</h2><div className="space-y-4 pt-4 border-t border-border/40 flex flex-col"><ModalInfo icon={<BookOpen size={20} />} label="Course" value={selectedItem.course} /><ModalInfo icon={<Calendar size={20} />} label="Deadline" value={new Date(selectedItem.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} />{!selectedItem.completed && <ModalInfo icon={<Clock size={20} />} label="Countdown" value={getCountdown(selectedItem.deadline)} color="text-accent" />}<ModalInfo icon={selectedItem.completed ? <CheckCircle size={20} /> : <Circle size={20} />} label="Status" value={selectedItem.completed ? 'Completed' : 'Pending'} color={selectedItem.completed ? 'text-green-500' : 'text-amber-500'} /></div></div>
              ) : (
                <div className="space-y-6 pt-4">
                  <div className="flex justify-between items-center mb-4"><span className="px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[11px] font-bold uppercase tracking-widest">{isEditing ? 'EDITING NOTE' : 'NOTE DETAILS'}</span>{!isEditing && <button onClick={startEditing} className="px-4 py-2 rounded-xl border border-accent/20 bg-accent/5 text-accent font-bold text-xs flex items-center gap-2 hover:bg-accent hover:text-white transition-all"><Edit3 size={16} /> EDIT</button>}</div>
                  {isEditing ? (
                    <div className="space-y-4 pt-4"><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-border/5 border border-border/20 rounded-xl px-4 py-2.5 text-xl font-bold focus:outline-none" /><textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-border/5 border border-border/20 rounded-xl px-4 py-4 min-h-[200px] resize-none focus:outline-none" /><button onClick={handleUpdateNote} className="w-full bg-accent text-white py-3 rounded-2xl font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-all">{submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={22} />} UPDATE NOTE</button></div>
                  ) : (
                    <><h2 className="text-4xl font-black tracking-tight leading-none mb-6 uppercase">{selectedItem.title}</h2><div className="max-h-[40vh] overflow-y-auto mb-10"><p className="text-muted leading-relaxed font-semibold text-xl italic whitespace-pre-wrap">"{selectedItem.content}"</p></div><div className="pt-8 border-t border-border/40 flex justify-between items-start"><div className="space-y-1"><p className="text-[10px] font-black text-muted/50 uppercase tracking-widest">CREATED AT</p><p className="text-sm font-bold">{new Date(selectedItem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div><div className="text-right space-y-1"><p className="text-[10px] font-black text-muted/50 uppercase tracking-widest">LAST UPDATED</p><p className="text-sm font-bold">{new Date(selectedItem.updatedAt || selectedItem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div></>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed top-6 right-6 z-50"><button onClick={() => setIsDark(!isDark)} className="p-3 glass rounded-2xl text-muted hover:text-foreground shadow-lg transition-all">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button></div>
    </div>
  );
}

const ModalInfo = ({ icon, label, value, color = "text-foreground" }) => (
  <div className="flex items-center gap-4"><div className="p-3 bg-accent/10 rounded-2xl text-accent w-fit">{icon}</div><div><p className="text-[10px] font-bold text-muted/50 uppercase tracking-widest">{label}</p><p className={`font-semibold text-lg ${color}`}>{value}</p></div></div>
);

export default App;
