'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.email, form.password, form.name, form.company);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-in">
        <h1>Messenger AI</h1>
        <p className="subtitle">Create your free account</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input className="form-input" placeholder="John Doe" value={form.name} onChange={update('name')} required /></div>
          <div className="form-group"><label>Email</label><input type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={update('email')} required /></div>
          <div className="form-group"><label>Company (optional)</label><input className="form-input" placeholder="Acme Inc." value={form.company} onChange={update('company')} /></div>
          <div className="form-group"><label>Password</label><input type="password" className="form-input" placeholder="Min 8 characters" value={form.password} onChange={update('password')} minLength={8} required /></div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 13 }}>Already have an account? <a href="/login">Sign in</a></p>
      </div>
    </div>
  );
}
