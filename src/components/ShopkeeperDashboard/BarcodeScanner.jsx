import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Search, Scan, Camera, X } from 'lucide-react';
import { InventoryBackend } from '../../services/supabase';

export default function BarcodeScanner({ user, data, reload, onAddToCart }) {
  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState('Camera module ready.');
  const [showCamera, setShowCamera] = useState(false);

  const onScanSuccess = (result) => {
    if (!result) return;
    // Handle both v1 and v2 API structures of the scanner
    const text = Array.isArray(result) ? result[0]?.rawValue : result?.rawValue || result;
    if (text) {
      setShowCamera(false);
      handleScan(text);
    }
  };

  const handleSimulateScan = () => {
    const demoBarcode = "737628064502"; 
    setBarcode(demoBarcode);
    setStatus('Simulated scan successful.');
    processBarcode(demoBarcode);
  };

  const handleScan = async (code) => {
    const cleanCode = code.trim().replace(/[\s-]/g, '');
    if (!cleanCode) return;
    setBarcode(cleanCode);
    
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}

    processBarcode(cleanCode);
  };

  const processBarcode = async (code) => {
    setStatus(`Looking up barcode ${code}...`);
    const existing = data.products.find(p => p.barcode === code);
    if (existing) {
      onAddToCart(existing.id);
      setStatus(`Found locally: ${existing.name}. Added to cart.`);
      setBarcode('');
      return;
    }

    let title = null;
    let brand = 'Manual entry';
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`, {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const d = await res.json();
        if (d.status === 1 && d.product) {
          title = d.product.product_name_en || d.product.product_name;
          brand = d.product.brands || brand;
        }
      }
    } catch (e) {}

    const productName = title || prompt(`No online record found for ${code}. Enter the item name:`);
    if (!productName) {
      setStatus('Scan cancelled.');
      setBarcode('');
      return;
    }

    const wh = 'WH1';
    const used = new Set(data.products.map(p => p.location));
    let location = { warehouse: wh, row: 'A', bin: 1 };
    outer: for (const r of ['A', 'B', 'C', 'D']) {
      for (let b = 1; b <= 20; b++) {
        const loc = `${wh}-R${r}-B${String(b).padStart(2, '0')}`;
        if (!used.has(loc)) { location = { warehouse: wh, row: r, bin: b }; break outer; }
      }
    }
    const locationCode = `${location.warehouse}-R${location.row}-B${String(location.bin).padStart(2, '0')}`;

    const newProduct = {
      userId: user.id,
      barcode: code,
      name: productName,
      brand,
      price: 10.00,
      quantity: 50,
      warehouse: location.warehouse,
      row: location.row,
      bin: location.bin,
      location: locationCode
    };

    try {
      const savedProduct = await InventoryBackend.saveProduct(newProduct);
      await InventoryBackend.saveMovement({
        id: Date.now().toString(),
        userId: user.id,
        timestamp: new Date().toISOString(),
        type: 'inward',
        productId: savedProduct.id,
        productName: savedProduct.name,
        quantity: savedProduct.quantity,
        location: savedProduct.location,
        details: 'Product added through barcode scan.'
      });
      await reload();
      onAddToCart(savedProduct.id);
      setStatus(`Added: ${productName}. Default price: ₹10, Qty: 50`);
      setBarcode('');
    } catch (err) {
      setStatus('Error adding scanned product: ' + err.message);
    }
  };

  return (
    <div className="glass-card">
      <h3><Search size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Billing & Barcode Reader</h3>
      <div className="form-group">
        <label>Scan Barcode / Enter UPC</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            value={barcode} 
            onChange={e=>setBarcode(e.target.value)} 
            placeholder="Scan or type barcode..." 
            onKeyDown={e => e.key === 'Enter' && handleScan(barcode)}
          />
          <button onClick={() => handleScan(barcode)}>Lookup</button>
        </div>
        <small style={{ color: 'var(--text-muted)' }}>Unregistered barcodes automatically fetch details online and stock your inventory.</small>
      </div>

      {showCamera ? (
        <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '12px', padding: '16px', marginTop: '16px', position: 'relative' }}>
          <button 
            onClick={() => setShowCamera(false)} 
            className="secondary icon-btn" 
            style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}
          >
            <X size={20} />
          </button>
          <Scanner 
            onScan={onScanSuccess} 
            onError={(err) => setStatus('Camera error: ' + err?.message)}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowCamera(true)} className="secondary" style={{ width: '100%' }}>
            <Camera size={16} /> Open Camera
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button onClick={handleSimulateScan} style={{ background: 'var(--success)', width: '100%' }}>
          <Scan size={16} /> Instant Demo Scan
        </button>
      </div>
      
      <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {status}
      </div>
    </div>
  );
}
