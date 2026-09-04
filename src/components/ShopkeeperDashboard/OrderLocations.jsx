import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export default function OrderLocations({ products }) {
  const [search, setSearch] = useState('');

  const terms = search.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
  
  const results = terms.map(term => {
    const matches = products.filter(p => p.name.toLowerCase().includes(term));
    return { term, matches };
  });

  return (
    <div className="glass-card">
      <h3><MapPin size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Order Intake: Find Items</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
        Enter product names separated by commas to locate items.
      </p>
      
      <div className="form-group">
        <input 
          type="text" 
          value={search} 
          onChange={e=>setSearch(e.target.value)} 
          placeholder="e.g. Rice, Soap"
        />
      </div>

      {search && (
        <div className="table-container" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr><th>Product</th><th>Location Code</th><th>Quantity</th></tr>
            </thead>
            <tbody>
              {results.map((res, i) => (
                <React.Fragment key={i}>
                  {res.matches.length === 0 ? (
                    <tr>
                      <td style={{ color: 'var(--danger)' }}>{res.term}</td>
                      <td colSpan="2">Not found</td>
                    </tr>
                  ) : (
                    res.matches.map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td><span className="badge">{p.location}</span></td>
                        <td>{p.quantity}</td>
                      </tr>
                    ))
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
