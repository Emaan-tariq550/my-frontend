import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, GraduationCap } from 'lucide-react';

export default function TeacherDashboard() {
  const { API, user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/teacher/dashboard`).then(r => setData(r.data.data));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem' }}>Welcome, {user?.name} 👋</h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Teacher Dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { label: 'My Classes', value: data?.totalClasses || 0, icon: BookOpen, color: 'var(--primary)' },
          { label: 'My Students', value: data?.totalStudents || 0, icon: GraduationCap, color: 'var(--student)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontFamily: 'Syne', fontWeight: 800, lineHeight: 1 }}>{value}</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 style={{ fontFamily: 'Syne', marginBottom: 16 }}>My Classes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {data?.classes?.map(c => (
            <div key={c._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ fontFamily: 'Syne' }}>{c.className} {c.section && `- ${c.section}`}</h4>
              {c.subjects?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {c.subjects.map(s => <span key={s} style={{ background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4, fontSize: '0.74rem', color: 'var(--text2)' }}>{s}</span>)}
                </div>
              )}
              <p style={{ color: 'var(--text3)', fontSize: '0.82rem' }}><GraduationCap size={13} style={{ display: 'inline', marginRight: 4 }} />{c.students?.length || 0} students</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}