import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, 
  ClipboardList, Settings, LogOut, Menu, X, Sun, Moon, Bell
} from 'lucide-react';

const navConfig = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/classes', label: 'Classes', icon: BookOpen },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/teacher/my-classes', label: 'My Classes', icon: BookOpen },
    { to: '/teacher/students', label: 'Students', icon: GraduationCap },
    { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardList },
    { to: '/teacher/settings', label: 'Settings', icon: Settings },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/settings', label: 'Settings', icon: Settings },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = navConfig[user?.role] || [];

  const roleColor = { admin: 'var(--admin)', teacher: 'var(--teacher)', student: 'var(--student)' };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 40, display: 'none'
        }} className="overlay" />
      )}

      {/* Sidebar */}
      <aside className={sidebarOpen ? 'open' : ''} style={{
        width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh',
        zIndex: 50, transition: 'transform 0.3s'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Syne', color: '#fff'
            }}>A</div>
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>ACADEX</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Academic Platform</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-sm)', padding: '12px',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${roleColor[user?.role]}, rgba(79,124,255,0.5))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Syne', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <span className={`badge badge-${user?.role}`} style={{ fontSize: '0.65rem', padding: '1px 7px' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                fontFamily: 'Syne', fontWeight: 600, fontSize: '0.88rem',
                color: isActive ? '#fff' : 'var(--text2)',
                background: isActive ? 'var(--primary)' : 'transparent',
                transition: 'all 0.15s',
                textDecoration: 'none'
              })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: 10, fontSize: '0.88rem', fontFamily: 'Syne' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ justifyContent: 'flex-start', gap: 10, fontSize: '0.88rem', fontFamily: 'Syne', color: 'var(--danger)' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 30
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'var(--text2)', display: 'none' }} className="menu-btn">
            <Menu size={22} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" style={{ padding: '8px' }}><Bell size={16} /></button>
            <button onClick={toggleTheme} className="btn btn-ghost btn-sm" style={{ padding: '8px' }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <div style={{ flex: 1, padding: '28px 24px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          aside { transform: translateX(-100%); }
          aside.open { transform: translateX(0) !important; }
          main { margin-left: 0 !important; }
          .menu-btn { display: flex !important; }
          .overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}