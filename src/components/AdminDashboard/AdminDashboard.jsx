import React, { useState, useEffect } from 'react';
import { InventoryBackend } from '../../services/supabase';
import { LogOut, Activity, AlertTriangle, Users, Package } from 'lucide-react';

export default function AdminDashboard({ user, onLogout }) {
  const [data, setData] = useState({ users: [], products: [] });

  useEffect(() => {
    const loadAdminData = async () => {
      const fresh = await InventoryBackend.loadData(user, true);
      setData(fresh);
    };
    loadAdminData();
  }, [user]);

  const handleLogout = async () => {
    await InventoryBackend.logout();
    onLogout();
  };

  const lowStock = data.products.filter(p => p.quantity <= 10);
  
  const rowStats = {};
  data.products.forEach(p => {
    const key = `${p.warehouse} / Row ${p.row}`;
    if (!rowStats[key]) rowStats[key] = { products: 0, quantity: 0 };
    rowStats[key].products++;
    rowStats[key].quantity += p.quantity;
  });
  const rowEntries = Object.entries(rowStats).sort((a,b) => a[0].localeCompare(b[0]));

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div className="flex-between glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="logo-text" style={{ fontSize: '1.8rem', margin: 0 }}>
            <Package size={28} className="logo-icon" /> PETIPACK
          </div>
          <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
            <h2 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>Administration</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>System Dashboard</p>
          </div>
        </div>
        <button onClick={handleLogout} className="secondary">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid-2 delay-1 animate-fade-in">
        <div className="glass-card">
          <h3><Users size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Registered Shopkeepers</h3>
          {data.users.length === 0 ? <p>No registered shopkeepers.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.users.map(u => {
                const pCount = data.products.filter(p => p.userId === u.id).length;
                return (
                  <div key={u.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '8px' }}>{u.shopName} (Owner: {u.username})</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Address: {u.address} | Email: {u.email}</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>Total Products Listed: {pCount}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="delay-2 animate-fade-in">
          <div className="glass-card">
            <h3><Activity size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Stock Overview by Row</h3>
            {rowEntries.length === 0 ? <p>No stock added.</p> : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Row</th><th>Product Types</th><th>Total Units</th></tr></thead>
                  <tbody>
                    {rowEntries.map(([row, stats]) => (
                      <tr key={row}><td>{row}</td><td>{stats.products}</td><td>{stats.quantity}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="glass-card">
            <h3><AlertTriangle size={20} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--danger)' }}/> Low-Stock Alerts</h3>
            {lowStock.length === 0 ? <p style={{ color: 'var(--success)' }}>All quantities are above the alert threshold.</p> : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Shopkeeper</th><th>Product</th><th>Location</th><th>Qty</th></tr></thead>
                  <tbody>
                    {lowStock.map(p => {
                      const owner = data.users.find(u => u.id === p.userId);
                      return (
                        <tr key={p.id}>
                          <td>{owner ? owner.shopName : 'Unknown'}</td>
                          <td>{p.name}</td>
                          <td><span className="badge">{p.location}</span></td>
                          <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{p.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
