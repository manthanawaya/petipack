import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, Upload, Scan } from 'lucide-react';
import { InventoryBackend } from '../../services/firebase';

export default function BarcodeScanner({ user, data, reload, onAddToCart }) {
  const [barcode, setBarcode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState('Camera preview is off.');
  const html5QrCode = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCode.current && cameraActive) {
        html5QrCode.current.stop().catch(console.error);
      }
    };
  }, [cameraActive]);

  const handleSimulateScan = () => {
    // For a smooth hackathon presentation, simulate a successful scan
    const demoBarcode = "737628064502"; 
    setBarcode(demoBarcode);
    setStatus('Simulated scan successful.');
    processBarcode(demoBarcode);
  };

  const handleFileUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setStatus('Analyzing image...');
      try {
        if (!html5QrCode.current) {
          html5QrCode.current = new Html5Qrcode('camera-preview');
        }
        const decodedText = await html5QrCode.current.scanFile(file, true);
        handleScan(decodedText);
      } catch (err) {
        setStatus('Could not detect a barcode in the image.');
      }
    }
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      await html5QrCode.current.stop();
      html5QrCode.current.clear();
      setCameraActive(false);
      setStatus('Camera preview is off.');
    } else {
      if (!html5QrCode.current) {
        html5QrCode.current = new Html5Qrcode('camera-preview');
      }
      try {
        await html5QrCode.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.777778 },
          (decodedText) => handleScan(decodedText),
          () => {}
        );
        setCameraActive(true);
        setStatus('Camera preview active. Point at barcode.');
      } catch (err) {
        setStatus('Camera permission denied or unavailable.');
      }
    }
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

    if (cameraActive) await toggleCamera();
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
      id: 'TRK-' + Math.floor(100000 + Math.random() * 900000),
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
      await InventoryBackend.saveProduct(newProduct);
      await InventoryBackend.saveMovement({
        id: Date.now().toString(),
        userId: user.id,
        timestamp: new Date().toISOString(),
        type: 'inward',
        productId: newProduct.id,
        productName: newProduct.name,
        quantity: newProduct.quantity,
        location: newProduct.location,
        details: 'Product added through barcode scan.'
      });
      await reload();
      onAddToCart(newProduct.id);
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

      <div className={`camera-preview-container ${cameraActive ? 'active' : ''}`} style={{ display: cameraActive ? 'block' : 'none' }}>
        <div id="camera-preview" style={{ width: '100%', minHeight: '200px' }}></div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
        <button onClick={toggleCamera} className={cameraActive ? 'secondary' : ''}>
          <Camera size={16} /> {cameraActive ? 'Close Camera' : 'Webcam'}
        </button>
        
        <label className="secondary icon-btn" style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', color: 'var(--text)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Upload size={16} /> Upload Image
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        <button onClick={handleSimulateScan} style={{ background: 'var(--success)' }}>
          <Scan size={16} /> Demo Scan
        </button>
      </div>
      <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        {status}
      </div>
    </div>
  );
}
