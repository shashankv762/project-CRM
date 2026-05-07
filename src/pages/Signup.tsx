import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Signup() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        window.location.href = '/';
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans py-12">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg space-y-6">
        <div className="text-center">
           <div className="bg-indigo-600 w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm mb-4 mx-auto text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" /></svg>
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your workspace</h1>
        </div>

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationName">Company Name</Label>
            <Input id="organizationName" required value={formData.organizationName} onChange={e => setFormData({...formData, organizationName: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={formData.password} minLength={6} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Creating workspace...' : 'Get Started'}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
