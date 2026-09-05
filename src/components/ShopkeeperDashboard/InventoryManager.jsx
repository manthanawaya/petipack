import React, { useState, useEffect } from 'react';
import { InventoryBackend } from '../../services/supabase';
import { PlusCircle } from 'lucide-react';

export default function InventoryManager({ user, data, reload, productToEdit, onEditComplete }) {
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [warehouse, setWarehouse] = useState('WH1');
  const [row, setRow] = useState('');
  const [bin, setBin] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setEditingId(productToEdit.id);
      setName(productToEdit.name || '');
      setPrice(productToEdit.price || '');
      setQty(productToEdit.quantity || '');
      setWarehouse(productToEdit.warehouse || 'WH1');
      setRow(productToEdit.row || '');
      setBin(productToEdit.bin || '');
    }
  }, [productToEdit]);

  const generateLocationDetails = (wh) => {
    const used = new Set(data.products.map(p => p.location));
    for (const r of ['A', 'B', 'C', 'D']) {
      for (let b = 1; b <= 20; b++) {
        const loc = `${wh}-R${r}-B${String(b).padStart(2, '0')}`;
        if (!used.has(loc)) return { warehouse: wh, row: r, bin: b };
      }
    }
    return { warehouse: wh, row: 'A', bin: 1 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((row && !bin) || (!row && bin)) {
      return alert('Select both a row and a bin, or leave both set to Auto-assign.');
    }

    const location = row && bin 
      ? { warehouse, row, bin: Number(bin) } 
      : generateLocationDetails(warehouse);
      
    const locationCode = `${location.warehouse}-R${location.row}-B${String(location.bin).padStart(2, '0')}`;
    
    if (data.products.some(p => p.id !== editingId && p.location === locationCode)) {
      return alert(`${locationCode} is already assigned to another product.`);
    }

    const productId = editingId || 'TRK-' + Math.floor(100000 + Math.random() * 900000);
    const product = {
      id: productId,
      userId: user.id,
      barcode: productId, // Auto-generate barcode to satisfy DB constraints
      name: name.trim(),
      price: parseFloat(price),
      quantity: parseInt(qty, 10),
      warehouse: location.warehouse,
      row: location.row,
      bin: location.bin,
      location: locationCode
    };

    try {
      const savedProduct = await InventoryBackend.saveProduct(product);
      
      const moveId = Date.now().toString() + Math.random().toString();
      await InventoryBackend.saveMovement({
        id: moveId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        type: 'inward',
        productId: savedProduct.id,
        productName: savedProduct.name,
        quantity: savedProduct.quantity,
        location: savedProduct.location,
        details: editingId ? 'Product updated' : 'New product added'
      });
      
      setName(''); setPrice(''); setQty(''); setRow(''); setBin(''); setEditingId(null);
      if (onEditComplete) onEditComplete();
      await reload();
    } catch (err) {
      alert('Error saving product: ' + err.message);
    }
  };

  return (
    <div className="glass-card">
      <h3><PlusCircle size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Manual Inventory Entry</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="grid-2" style={{ gap: '16px' }}>
          <div className="form-group">
            <label>Price (₹)</label>
            <input type="number" step="0.01" min="0" value={price} onChange={e=>setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" min="0" value={qty} onChange={e=>setQty(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <label>Warehouse</label>
          <select value={warehouse} onChange={e=>setWarehouse(e.target.value)}>
            <option value="WH1">Warehouse WH1</option>
            <option value="WH2">Warehouse WH2</option>
            <option value="WH3">Warehouse WH3</option>
          </select>
        </div>
        <div className="grid-2" style={{ gap: '16px' }}>
          <div className="form-group">
            <label>Row (Optional)</label>
            <select value={row} onChange={e=>setRow(e.target.value)}>
              <option value="">Auto-assign</option>
              <option value="A">Row A</option><option value="B">Row B</option>
              <option value="C">Row C</option><option value="D">Row D</option>
            </select>
          </div>
          <div className="form-group">
            <label>Bin (Optional)</label>
            <select value={bin} onChange={e=>setBin(e.target.value)}>
              <option value="">Auto-assign</option>
              {[...Array(20)].map((_, i) => <option key={i+1} value={i+1}>Bin {String(i+1).padStart(2,'0')}</option>)}
            </select>
          </div>
        </div>
        <button type="submit" style={{ width: '100%' }}>{editingId ? 'Update Product' : 'Add to Inventory'}</button>
      </form>
    </div>
  );
}
