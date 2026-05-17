import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { Sun, Moon, User, Lock, Check } from 'lucide-react';

const checkPassword = (p) => ({
  length: p.length >= 8, upper: /[A-Z]/.test(p), lower: /[a-z]/.test(p),
  number: /[0-9]/.test(p), special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
});

export default function Settings() {
  const { user, updateUser, API } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const pwChecks = checkPassword(passwordForm.newPassword);
  const pwValid = Object.values(pwChecks).every(Boolean);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API}/auth/update-profile`, profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) return toast.error('Passwords do not match');
    if (!pwValid) return toast.error('Password does not meet requirements');
    setSaving(true);
    try {
      await axios.put(`${API}/auth/change-password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne', fontSize: '1.5rem' }}>Settings</h2>
        <p style={{ color: 'var(--text3)', fontSize: '0.88rem' }}>Manage your account preferences</p>
      </div>

      {/* Theme */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Sun size={18} /> Appearance</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Theme</p>
            <p style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>Currently: {theme} mode</p>
          </div>
          <button onClick={toggleTheme} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Profile</h3>
        <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={user?.email} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input value={user?.role} disabled style={{ opacity: 0.6, textTransform: 'capitalize' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
            {saving ? 'Saving...' : <><Check size={15} /> Save Profile</>}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <h3 style={{ fontFamily: 'Syne', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={18} /> Change Password</h3>
        <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']].map(([key, label]) => (
            <div key={key} className="form-group">
              <label>{label}</label>
              <input type="password" value={passwordForm[key]} onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })} required />
            </div>
          ))}
          {passwordForm.newPassword && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[['length','8+ chars'],['upper','Uppercase'],['lower','Lowercase'],['number','Number'],['special','Special']].map(([k, l]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: pwChecks[k] ? 'var(--success)' : 'var(--text3)' }}>
                  <Check size={11} /> {l}
                </div>
              ))}
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
            {saving ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}