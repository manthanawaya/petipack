import React, { useState } from 'react';
import { InventoryBackend } from '../services/supabase';
import { LogIn, UserPlus, Shield, Package } from 'lucide-react';

function Auth({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');

  const handleTabSwitch = (newTab) => {
    setTab(newTab);
    setError('');
    if (newTab === 'admin') {
      setEmail('admin@petipack.com');
      setPassword('admin123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await InventoryBackend.login(email, password);
      if (tab === 'admin' && !user.isAdmin) {
        throw new Error('Admin role required');
      }
      onLogin(user);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const masterKey = 'MK-' + Math.floor(100000 + Math.random() * 900000);
      await InventoryBackend.register({
        email,
        masterKey,
        username,
        shopName,
        address
      });
      alert(`Registration Successful!\nYour Master Key is: ${masterKey}\nPlease keep it safe.`);
      setTab('login');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="logo-text">
            <Package size={40} className="logo-icon" /> PETIPACK
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Multi-Warehouse Inventory System</p>
        </div>
        
        <div className="nav-tabs delay-1 animate-fade-in">
          <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => handleTabSwitch('login')}>
            <LogIn size={16} /> Login
          </button>
          <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => handleTabSwitch('register')}>
            <UserPlus size={16} /> Register
          </button>
          <button className={`tab-btn ${tab === 'admin' ? 'active' : ''}`} onClick={() => handleTabSwitch('admin')}>
            <Shield size={16} /> Admin
          </button>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}

        {(tab === 'login' || tab === 'admin') && (
          <form onSubmit={handleLogin} className="delay-2 animate-fade-in">
            <h3>{tab === 'admin' ? 'System Administrator Login' : 'Shopkeeper Sign In'}</h3>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>{tab === 'admin' ? 'Password' : 'Master Key'}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={tab === 'admin' ? 'Password' : 'Enter your Master Key'} required />
            </div>
            <button type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Login'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="delay-2 animate-fade-in">
            <h3>New Shopkeeper Registration</h3>
            <div className="form-group">
              <label>Shop Name</label>
              <input type="text" value={shopName} onChange={e => setShopName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Shop Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Processing...' : 'Request & Generate Master Key'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Auth;
