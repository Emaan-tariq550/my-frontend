import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, CheckCircle, XCircle } from 'lucide-react';

const checkPassword = (p) => ({
  length: p.length >= 8,
  upper: /[A-Z]/.test(p),
  lower: /[a-z]/.test(p),
  number: /[0-9]/.test(p),
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
});

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', rollNumber: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwChecks = checkPassword(form.password);
  const pwValid = Object.values(pwChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwValid) return toast.error('Please meet all password requirements');
    setLoading(true);
    try {
      const user = await signup(form);
      toast.success('Account created! Welcome to ACADEX.');
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      const errors = err.response?.data?.errors;
      if (errors?.length) errors.forEach(e => toast.error(e));
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Check = ({ ok, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: ok ? 'var(--success)' : 'var(--text3)', fontSize: '0.78rem' }}>
      {ok ? <CheckCircle size={12} /> : <XCircle size={12} />} {label}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '20px',
      backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(79,124,255,0.07) 0%, transparent 60%)'
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Syne', color: '#fff'
          }}>A</div>
          <h1 style={{ fontSize: '1.8rem', fontFamily: 'Syne', letterSpacing: '-0.03em' }}>Create Account</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.88rem', marginTop: 4 }}>Join ACADEX with your institutional email</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {form.role === 'student' && (
              <div className="form-group">
                <label>Roll Number</label>
                <input type="text" placeholder="bscs23001" value={form.rollNumber}
                  onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
            )}

            <div className="form-group">
              <label>Institutional Email</label>
              <input type="email" placeholder="rollno@university.edu" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
              <span style={{ fontSize: '0.73rem', color: 'var(--text3)' }}>Only .edu or .edu.pk emails accepted</span>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} placeholder="Create strong password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text3)'
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 6 }}>
                  <Check ok={pwChecks.length} label="8+ characters" />
                  <Check ok={pwChecks.upper} label="Uppercase" />
                  <Check ok={pwChecks.lower} label="Lowercase" />
                  <Check ok={pwChecks.number} label="Number" />
                  <Check ok={pwChecks.special} label="Special char" />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 4 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text3)', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}