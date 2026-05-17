import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, X, BookOpen } from 'lucide-react';

const EMPTY = { name: '', email: '', rollNumber: '', age: '', phone: '', class: '' };

export default function Students() {
  const { API, user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modal, setModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [marksModal, setMarksModal] = useState(null);
  const [marksForm, setMarksForm] = useState({ subject: '', marks: '', totalMarks: 100, grade: '', exam: 'midterm' });

  const fetch = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        axios.get(`${API}/student/all?search=${search}&page=${page}&limit=10`),
        axios.get(`${API}/classes`)
      ]);
      setStudents(sRes.data.data);
      setPagination(sRes.data.pagination);
      setClasses(cRes.data.data);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [search, page]);

  const openAdd = () => { setEditStudent(null); setForm(EMPTY); setModal(true); };
  const openEdit = (s) => { setEditStudent(s); setForm({ name: s.name, email: s.email || '', rollNumber: s.rollNumber, age: s.age || '', phone: s.phone || '', class: s.class?._id || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editStudent) {
        await axios.put(`${API}/student/${editStudent._id}`, form);
        toast.success('Student updated');
      } else {
        await axios.post(`${API}/student`, form);
        toast.success('Student added');
      }
      setModal(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await axios.delete(`${API}/student/${id}`);
      toast.success('Student deleted');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const addMarks = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/student/${marksModal._id}/marks`, marksForm);
      toast.success('Marks added');
      setMarksModal(null);
      fetch();
    } catch (err) {
      toast.error('Failed to add marks');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontFamily: 'Syne' }}>Students</h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>{pagination.total || 0} total students</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Student</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input placeholder="Search by name, roll number, or email..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 36 }} />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text3)' }}>
            <GraduationCap size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No students found</p>
          </div>
        ) : (
          <table>
            <thead><tr>
              <th>Student</th><th>Roll No.</th><th>Class</th><th>Email</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--student), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Syne', fontWeight: 700, fontSize: '0.8rem', color: '#fff'
                      }}>{s.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem' }}>{s.name}</span>
                    </div>
                  </td>
                  <td><code style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontSize: '0.82rem' }}>{s.rollNumber}</code></td>
                  <td>{s.class ? `${s.class.className}${s.class.section ? ' - ' + s.class.section : ''}` : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                  <td>{s.email || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setMarksModal(s)} title="Add Marks"><BookOpen size={14} /></button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                      {user.role === 'admin' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'center' }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne' }}>{editStudent ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={() => setModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['name', 'Full Name', 'text', 'John Doe'], ['rollNumber', 'Roll Number', 'text', 'bscs23001'], ['email', 'Email', 'email', 'student@uni.edu'], ['age', 'Age', 'number', '20'], ['phone', 'Phone', 'text', '+92xxxxxxxxxx']].map(([key, label, type, ph]) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={['name','rollNumber'].includes(key)} />
                </div>
              ))}
              <div className="form-group">
                <label>Class</label>
                <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                  <option value="">Select class</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section && `- ${c.section}`}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editStudent ? 'Update' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marks Modal */}
      {marksModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne' }}>Add Marks — {marksModal.name}</h3>
              <button onClick={() => setMarksModal(null)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}><X size={16} /></button>
            </div>
            <form onSubmit={addMarks} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['subject', 'Subject', 'text', 'Mathematics'], ['marks', 'Marks Obtained', 'number', '85'], ['totalMarks', 'Total Marks', 'number', '100'], ['grade', 'Grade', 'text', 'A+']].map(([key, label, type, ph]) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input type={type} placeholder={ph} value={marksForm[key]} onChange={e => setMarksForm({ ...marksForm, [key]: e.target.value })} required={['subject','marks'].includes(key)} />
                </div>
              ))}
              <div className="form-group">
                <label>Exam Type</label>
                <select value={marksForm.exam} onChange={e => setMarksForm({ ...marksForm, exam: e.target.value })}>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMarksModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Marks</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}