import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Attendance() {
  const { API } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [classData, setClassData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API}/teacher/my-classes`).then(r => setClasses(r.data.data));
  }, []);

  const loadClass = async (classId) => {
    setSelectedClass(classId);
    const cls = classes.find(c => c._id === classId);
    setClassData(cls);
    if (cls) {
      const init = {};
      cls.students?.forEach(s => { init[s._id] = 'present'; });
      setAttendance(init);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return toast.error('Select a class');
    if (!subject) return toast.error('Enter subject');
    
    const records = Object.entries(attendance).map(([student, status]) => ({ student, status }));
    setSubmitting(true);
    try {
      await axios.post(`${API}/attendance`, { classId: selectedClass, subject, date, records });
      toast.success('Attendance saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const setStatus = (studentId, status) => setAttendance(prev => ({ ...prev, [studentId]: status }));

  const statusBtn = (studentId, status, icon, label, color) => (
    <button type="button" onClick={() => setStatus(studentId, status)}
      style={{
        padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
        background: attendance[studentId] === status ? color : 'var(--surface2)',
        color: attendance[studentId] === status ? '#fff' : 'var(--text3)',
        fontSize: '0.78rem', fontFamily: 'Syne', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
        transition: 'all 0.15s'
      }}>
      {icon}{label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem' }}>Take Attendance</h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Mark attendance for your class</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label>Class</label>
              <select value={selectedClass} onChange={e => loadClass(e.target.value)} required>
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.className} {c.section && `- ${c.section}`}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} required>
                <option value="">Select subject</option>
                {classData?.subjects?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
          </div>
        </div>

        {classData && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: '1rem' }}>Students ({classData.students?.length || 0})</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => classData.students?.forEach(s => setStatus(s._id, 'present'))}>All Present</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => classData.students?.forEach(s => setStatus(s._id, 'absent'))}>All Absent</button>
              </div>
            </div>
            {classData.students?.length === 0 ? (
              <p style={{ padding: 24, color: 'var(--text3)', textAlign: 'center' }}>No students enrolled in this class</p>
            ) : (
              classData.students?.map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'Syne' }}>{s.name}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>{s.rollNumber}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {statusBtn(s._id, 'present', <CheckCircle size={12}/>, 'Present', '#10b981')}
                    {statusBtn(s._id, 'absent', <XCircle size={12}/>, 'Absent', '#ef4444')}
                    {statusBtn(s._id, 'late', <Clock size={12}/>, 'Late', '#f59e0b')}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {classData && (
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '12px 28px' }} disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Attendance'}
          </button>
        )}
      </form>
    </div>
  );
}