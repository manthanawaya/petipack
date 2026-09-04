import React from 'react';

export default function PrintableBill({ billData, onClose }) {
  if (!billData) return null;

  return (
    <div id="printable-bill" style={{ background: 'white', color: 'black', minHeight: '100vh', padding: '40px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{billData.shopName}</h2>
      <p style={{ color: '#555', marginBottom: '24px' }}>{billData.address}</p>
      <hr style={{ borderColor: '#eee', marginBottom: '24px' }} />
      
      <h3 style={{ marginBottom: '16px' }}>Invoice Receipt</h3>
      <p style={{ marginBottom: '24px' }}>Date: {billData.date}</p>
      
      <table style={{ width: '100%', marginBottom: '32px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: '12px 0' }}>Product Name</th>
            <th style={{ textAlign: 'right', padding: '12px 0' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '12px 0' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '12px 0' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {billData.cart.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'right', padding: '12px 0' }}>₹{Number(item.price).toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: '12px 0' }}>{item.qty}</td>
              <td style={{ textAlign: 'right', padding: '12px 0' }}>₹{(item.price * item.qty).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ textAlign: 'right', marginTop: '24px' }}>
        <p style={{ marginBottom: '8px' }}>Discount ({billData.discountPercent}%): ₹{billData.discountAmount.toFixed(2)}</p>
        <h2 style={{ marginTop: '16px', fontSize: '1.75rem' }}>Grand Total: ₹{billData.total.toFixed(2)}</h2>
      </div>
      
      <div className="no-print" style={{ marginTop: '60px', textAlign: 'center' }}>
        <button onClick={() => window.print()} style={{ marginRight: '16px' }}>Print / Save as PDF</button>
        <button onClick={onClose} className="secondary">Back to Dashboard</button>
      </div>
    </div>
  );
}
