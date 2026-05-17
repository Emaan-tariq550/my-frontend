import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Pencil, Users } from 'lucide-react';

const EMPTY = { className: '', section: '', subjects: '', teacherAssigned: '' };

export default function Classes() {
  const { API } = useAuth();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [editCls, setEditCls] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [enrollModal, setEnrollModal] = useState(null);

  const fetch = async () => {
    const [cRes, tRes, sRes] = await Promise.all([
      axios.get(`${API}/classes`),
      axios.get(`${API}/admin/teachers`),
      axios.get(`${API}/student/all?limit=100`)
    ]);
    setClasses(cRes.data.data);
    setTeachers(tRes.data.data);
    setStudents(sRes.data.data);
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setEditCls(null); setForm(EMPTY); setModal(true); };
  const openEdit = (c) => {
    setEditCls(c);
    setForm({ className: c.className, section: c.section || '', subjects: c.subjects?.join(', ') || '', teacherAssigned: c.teacherAssigned?._id || '' });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      if (editCls) await axios.put(`${API}/classes/${editCls._id}`, payload);
      else await axios.post(`${API}/classes`, payload);
      toast.success(editCls ? 'Class updated' : 'Class created');
      setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    await axios.delete(`${API}/classes/${id}`);
    toast.success('Class deleted'); fetch();
  };

  const enrollStudent = async (classId, studentId) => {
    await axios.post(`${API}/classes/${classId}/add-student`, { studentId });
    toast.success('Student enrolled'); fetch();
  };

  const unenrollStudent = async (classId, studentId) => {
    await axios.post(`${API}/classes/${classId}/remove-student`, { studentId });
    toast.success('Student removed'); fetch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem' }}>Classes</h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>{classes.length} classes total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Create Class</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {classes.map(c => (
          <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: 'Syne', fontSize: '1.05rem' }}>{c.className} {c.section && <span style={{ color: 'var(--text3)', fontWeight: 500 }}>- {c.section}</span>}</h3>
                {c.teacherAssigned && <p style={{ color: 'var(--teacher)', fontSize: '0.8rem', marginTop: 2 }}>👨‍🏫 {c.teacherAssigned.name}</p>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}><Pencil size={13} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><Trash2 size={13} /></button>
              </div>
            </div>

            {c.subjects?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.subjects.map(s => (
                  <span key={s} style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', color: 'var(--text2)' }}>{s}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}><Users size={13} style={{ display: 'inline', marginRight: 4 }} />{c.students?.length || 0} students</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setEnrollModal(c)}>Manage Students</button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne' }}>{editCls ? 'Edit Class' : 'Create Class'}</h3>
              <button onClick={() => setModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label>Class Name</label><input placeholder="e.g. BSCS 2023" value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} required /></div>
              <div className="form-group"><label>Section</label><input placeholder="e.g. A, B, Morning" value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} /></div>
              <div className="form-group"><label>Subjects (comma separated)</label><input placeholder="Math, Physics, CS" value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} /></div>
              <div className="form-group">
                <label>Assign Teacher</label>
                <select value={form.teacherAssigned} onChange={e => setForm({ ...form, teacherAssigned: e.target.value })}>
                  <option value="">No teacher assigned</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editCls ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Students Modal */}
      {enrollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 540, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne' }}>Manage — {enrollModal.className}</h3>
              <button onClick={() => { setEnrollModal(null); fetch(); }} className="btn btn-ghost btn-sm" style={{ padding: 6 }}><X size={16} /></button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.82rem', marginBottom: 12 }}>Enrolled Students</p>
              {enrollModal.students?.length === 0 && <p style={{ color: 'var(--text3)', fontSize: '0.88rem', marginBottom: 16 }}>No students enrolled</p>}
              {enrollModal.students?.map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.88rem' }}>{s.name} <code style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{s.rollNumber}</code></span>
                  <button className="btn btn-danger btn-sm" onClick={() => unenrollStudent(enrollModal._id, s._id)}>Remove</button>
                </div>
              ))}
              <p style={{ color: 'var(--text3)', fontSize: '0.82rem', margin: '16px 0 8px' }}>Add Students</p>
              {students.filter(s => !enrollModal.students?.find(es => es._id === s._id)).map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.88rem' }}>{s.name} <code style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{s.rollNumber}</code></span>
                  <button className="btn btn-success btn-sm" onClick={() => enrollStudent(enrollModal._id, s._id)}>Enroll</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}