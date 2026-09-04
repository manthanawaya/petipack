import React, { useState } from 'react';
import { ShoppingCart, FileText } from 'lucide-react';

export default function BillingCart({ cart, updateCartQty, onGenerate }) {
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  return (
    <div className="glass-card">
      <h3><ShoppingCart size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Current Bill Items</h3>
      
      <div className="table-container" style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '16px' }}>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Adjust</th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>₹{Number(item.price).toFixed(2)}</td>
                <td>{item.qty}</td>
                <td>₹{(item.price * item.qty).toFixed(2)}</td>
                <td>
                  <div className="flex-gap">
                    <button className="secondary icon-btn" onClick={() => updateCartQty(item.id, -1)}>−</button>
                    <button className="icon-btn" onClick={() => updateCartQty(item.id, 1)}>+</button>
                  </div>
                </td>
              </tr>
            ))}
            {cart.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Cart is empty.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div className="flex-gap" style={{ justifyContent: 'flex-end', marginBottom: '8px' }}>
          <label style={{ margin: 0 }}>Discount (%)</label>
          <input 
            type="number" 
            min="0" max="100" 
            value={discount} 
            onChange={e => setDiscount(Number(e.target.value))} 
            style={{ width: '100px' }} 
          />
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Discount Amount: ₹{discountAmount.toFixed(2)}</p>
        <h2 style={{ marginTop: '8px', marginBottom: '16px', color: 'var(--success)' }}>Total: ₹{total.toFixed(2)}</h2>
        
        <button 
          onClick={() => onGenerate(discount)} 
          disabled={cart.length === 0} 
          style={{ width: '100%' }}
        >
          <FileText size={18} /> Generate & Print Bill
        </button>
      </div>
    </div>
  );
}
