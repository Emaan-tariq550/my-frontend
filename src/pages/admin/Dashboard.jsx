import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Users, GraduationCap, BookOpen, TrendingUp, UserCheck, UserX, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { API } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/dashboard`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>;

  const stats = [
    { label: 'Total Students', value: data?.totalStudents || 0, icon: GraduationCap, color: 'var(--student)' },
    { label: 'Total Teachers', value: data?.totalTeachers || 0, icon: Users, color: 'var(--teacher)' },
    { label: 'Total Classes', value: data?.totalClasses || 0, icon: BookOpen, color: 'var(--primary)' },
    { label: 'Admins', value: data?.totalAdmins || 0, icon: TrendingUp, color: 'var(--admin)' },
  ];

  const pieData = [
    { name: 'Present', value: data?.attendance?.present || 0 },
    { name: 'Absent', value: data?.attendance?.absent || 0 },
    { name: 'Late', value: data?.attendance?.late || 0 },
  ];
  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'Syne', marginBottom: 4 }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Overview of ACADEX platform activity</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.8rem', fontFamily: 'Syne', fontWeight: 800, lineHeight: 1 }}>{value}</div>
              <div style={{ color: 'var(--text3)', fontSize: '0.8rem', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Attendance Pie */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: 16, fontSize: '1rem' }}>Attendance Overview</h3>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            {[{icon: UserCheck, label: 'Present', val: data?.attendance?.present || 0, color: '#10b981'},
              {icon: UserX, label: 'Absent', val: data?.attendance?.absent || 0, color: '#ef4444'},
              {icon: Clock, label: 'Late', val: data?.attendance?.late || 0, color: '#f59e0b'}
            ].map(({icon: Icon, label, val, color}) => (
              <div key={label} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '1.4rem', fontFamily: 'Syne', fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{label}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Students */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne', marginBottom: 16, fontSize: '1rem' }}>Recent Students</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data?.recentStudents?.length ? data.recentStudents.map(s => (
              <div key={s._id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--student), var(--primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne', fontWeight: 700, fontSize: '0.8rem', color: '#fff'
                }}>{s.name?.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Syne' }}>{s.name}</div>
                  <div style={{ color: 'var(--text3)', fontSize: '0.75rem' }}>{s.rollNumber}</div>
                </div>
                {s.class && <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{s.class.className}</span>}
              </div>
            )) : <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>No students yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}