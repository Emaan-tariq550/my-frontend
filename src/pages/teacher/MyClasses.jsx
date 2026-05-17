import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function MyClasses() {
  const { API } = useAuth();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axios.get(`${API}/teacher/my-classes`).then(r => setClasses(r.data.data));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem' }}>My Classes</h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>{classes.length} assigned classes</p>
      </div>
      {classes.map(c => (
        <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontFamily: 'Syne' }}>{c.className} {c.section && `- ${c.section}`}</h3>
              {c.subjects?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {c.subjects.map(s => <span key={s} style={{ background: 'rgba(79,124,255,0.12)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 500 }}>{s}</span>)}
                </div>
              )}
            </div>
            <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}><GraduationCap size={14} style={{ display: 'inline' }} /> {c.students?.length || 0} students</span>
          </div>
          <div>
            <p style={{ color: 'var(--text3)', fontSize: '0.8rem', marginBottom: 10, fontFamily: 'Syne', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Enrolled Students</p>
            {c.students?.length === 0 ? (
              <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>No students enrolled yet</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {c.students?.map(s => (
                  <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--student), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 700, fontSize: '0.75rem', color: '#fff', flexShrink: 0 }}>
                      {s.name?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{s.rollNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}