import React, { useState } from 'react';
import { Box, ShoppingCart } from 'lucide-react';

export default function InventoryTable({ products, onAddToCart, reload }) {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="glass-card">
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <h3><Box size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Current Inventory</h3>
        <input 
          type="text" 
          placeholder="Search product..." 
          value={search} 
          onChange={e=>setSearch(e.target.value)}
          style={{ width: '250px' }}
        />
      </div>
      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Location</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><code>{p.id.substring(0, 8)}...</code></td>
                <td>
                  <div>{p.name}</div>
                  {p.brand && <small style={{ color: 'var(--text-muted)' }}>{p.brand}</small>}
                </td>
                <td><span className="badge">{p.location}</span></td>
                <td>₹{Number(p.price).toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <button className="icon-btn" onClick={() => onAddToCart(p.id)} title="Add to Cart">
                    <ShoppingCart size={16} /> Add
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No products found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
