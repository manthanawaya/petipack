import React, { useState, useEffect } from 'react';
import { InventoryBackend } from '../../services/firebase';
import InventoryManager from './InventoryManager';
import BarcodeScanner from './BarcodeScanner';
import InventoryTable from './InventoryTable';
import BillingCart from './BillingCart';
import OrderLocations from './OrderLocations';
import PrintableBill from '../PrintableBill';
import { LogOut, Package } from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const [data, setData] = useState({ products: [], movements: [] });
  const [cart, setCart] = useState([]);
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState(null);

  const loadData = async () => {
    const freshData = await InventoryBackend.loadData(user, false);
    setData(freshData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await InventoryBackend.logout();
    onLogout();
  };

  const addToCart = (productId) => {
    const product = data.products.find(p => p.id === productId);
    if (!product || product.quantity <= 0) {
      alert('Item out of stock!');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        if (existing.qty + 1 > product.quantity) {
          alert('Insufficient stock!');
          return prev;
        }
        return prev.map(item => item.id === productId ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleGenerateBill = async (discountPercent) => {
    try {
      const { products } = await InventoryBackend.completeSale(cart, discountPercent);
      await loadData();
      
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discountAmount = subtotal * (discountPercent / 100);
      setBillData({
        cart,
        discountPercent,
        discountAmount,
        total: subtotal - discountAmount,
        shopName: user.shopName,
        address: user.address,
        date: new Date().toLocaleString()
      });
      setShowBill(true);
      setCart([]);
    } catch (err) {
      alert(err.message || 'Error completing sale');
    }
  };

  if (showBill) {
    return <PrintableBill billData={billData} onClose={() => setShowBill(false)} />;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px' }}>
      <div className="flex-between glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="logo-text" style={{ fontSize: '1.8rem', margin: 0 }}>
            <Package size={28} className="logo-icon" /> PETIPACK
          </div>
          <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
            <h2 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>{user.shopName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.address}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="secondary">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid-2 delay-1 animate-fade-in">
        <InventoryManager user={user} data={data} reload={loadData} />
        <BarcodeScanner user={user} data={data} reload={loadData} onAddToCart={addToCart} />
      </div>

      <div className="grid-2 delay-2 animate-fade-in" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <OrderLocations products={data.products} />
          <InventoryTable products={data.products} onAddToCart={addToCart} reload={loadData} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <BillingCart cart={cart} updateCartQty={updateCartQty} onGenerate={handleGenerateBill} />
          <div className="glass-card">
            <h3><Package size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Audit Log</h3>
            <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr><th>Date</th><th>Type</th><th>Product</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  {data.movements.slice().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(m => (
                    <tr key={m.id}>
                      <td>{new Date(m.timestamp).toLocaleDateString()}</td>
                      <td><span className={`badge ${m.type === 'outward' ? 'danger' : ''}`}>{m.type}</span></td>
                      <td>{m.productName}</td>
                      <td>{m.quantity}</td>
                    </tr>
                  ))}
                  {data.movements.length === 0 && <tr><td colSpan="4">No movements recorded.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
