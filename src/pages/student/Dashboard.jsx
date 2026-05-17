import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { API, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await axios.get(`${API}/student/me/profile`);
        setProfile(pRes.data.data);
        if (pRes.data.data?._id) {
          const aRes = await axios.get(`${API}/attendance/student/${pRes.data.data._id}`);
          setAttendance(aRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;

  const marksData = profile?.marks?.reduce((acc, m) => {
    const ex = acc.find(a => a.subject === m.subject);
    if (!ex) acc.push({ subject: m.subject, marks: m.marks, total: m.totalMarks });
    return acc;
  }, []) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.6rem' }}>Welcome, {user?.name} 🎓</h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Your academic dashboard</p>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--student), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: '#fff'
          }}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1.1rem' }}>{profile.name}</h3>
            <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginTop: 2 }}>Roll No: <code>{profile.rollNumber}</code></p>
            {profile.class && <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Class: {profile.class.className} {profile.class.section && `- ${profile.class.section}`}</p>}
          </div>
          {attendance && (
            <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'Syne', fontWeight: 800, color: attendance.stats.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>{attendance.stats.percentage}%</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>Attendance</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Marks */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: 16 }}>Academic Performance</h3>
          {marksData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marksData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="marks" fill="var(--primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>No marks recorded yet</p>}
        </div>

        {/* Recent Marks */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: 16 }}>Recent Marks</h3>
          {profile?.marks?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {profile.marks.slice(-5).reverse().map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Syne' }}>{m.subject}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.75rem', textTransform: 'capitalize' }}>{m.exam}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: m.marks / m.totalMarks >= 0.7 ? 'var(--success)' : 'var(--danger)' }}>{m.marks}/{m.totalMarks}</div>
                    {m.grade && <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>{m.grade}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>No marks yet</p>}
        </div>
      </div>

      {/* Attendance breakdown */}
      {attendance && (
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: 16 }}>Attendance Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total', val: attendance.stats.total, color: 'var(--primary)' },
              { label: 'Present', val: attendance.stats.present, color: 'var(--success)' },
              { label: 'Absent', val: attendance.stats.absent, color: 'var(--danger)' },
              { label: 'Late', val: attendance.stats.late, color: 'var(--warning)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: 12, background: 'var(--surface2)', borderRadius: 8 }}>
                <div style={{ fontSize: '1.5rem', fontFamily: 'Syne', fontWeight: 800, color }}>{val}</div>
                <div style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>{label}</div>
              </div>
            ))}
          </div>
          {attendance.data?.slice(0, 8).map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem' }}>{r.subject}</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{new Date(r.date).toLocaleDateString()}</span>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}