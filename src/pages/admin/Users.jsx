import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, X } from 'lucide-react';

export default function Users() {
  const { API, user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'teacher' });

  const fetch = () => axios.get(`${API}/admin/users`).then(r => setUsers(r.data.data));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/create-user`, form);
      toast.success('User created'); setModal(false); fetch();
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs) errs.forEach(e => toast.error(e));
      else toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id, role) => {
    if (role === 'admin') return toast.error('Cannot delete admin accounts');
    if (!confirm('Delete user?')) return;
    try {
      await axios.delete(`${API}/admin/user/${id}`);
      toast.success('User deleted'); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem' }}>Users</h2>
          <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>{users.length} accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={16} /> Create User</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={{ fontWeight: 600, color: 'var(--text)' }}>{u.name} {u._id === me._id && <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: '0.78rem' }}>(you)</span>}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u._id !== me._id && u.role !== 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id, u.role)}><Trash2 size={13} /></button>
                  )}
                  {u.role === 'admin' && u._id !== me._id && <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>Protected</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne' }}>Create User</h3>
              <button onClick={() => setModal(false)} className="btn btn-ghost btn-sm" style={{ padding: 6 }}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label>Full Name</label><input placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="form-group"><label>Institutional Email</label><input type="email" placeholder="name@university.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div className="form-group"><label>Password</label><input type="password" placeholder="Strong password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}