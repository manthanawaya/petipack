# 📦 PETIPACK

> **A Multi-Warehouse E-Commerce Inventory & Billing System**  
> *Built for speed, accuracy, and scale.*

### 🌍 Live Demo: [https://petipack.vercel.app/](https://petipack.vercel.app/)

---

## 🚀 The Vision

In modern retail and warehouse management, tracking stock across multiple locations while handling rapid point-of-sale billing can be chaotic. **PETIPACK** solves this by offering a unified, lightning-fast dashboard that seamlessly merges **multi-warehouse inventory tracking** with an integrated **billing and barcode-scanning checkout system**. 

With a premium, modern user interface, PETIPACK reduces the cognitive load on shopkeepers and provides system administrators with birds-eye analytics of their entire operation.

---

## ✨ Key Features

- **📸 Smart Barcode Scanning**: Scan items instantly using your webcam, upload an image, or use our quick "Demo Scan" feature. Unrecognized barcodes are automatically looked up against global databases (Open Food Facts & Open Library) to instantly fetch product names!
- **🏢 Multi-Warehouse Management**: Assign stock to specific warehouses (WH1, WH2, WH3), rows, and individual bins. Never lose track of an item again.
- **🛒 Integrated Point of Sale (POS)**: Add items to the cart, apply custom discounts, and instantly generate print-ready invoice receipts.
- **📈 Real-Time Admin Analytics**: A dedicated admin portal tracks registered shopkeepers, provides a breakdown of stock by row, and flags low-stock items automatically.
- **🛡️ Audit Logging**: Every stock movement (inward, outward, transfers) is meticulously logged for accountability.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Vanilla CSS featuring a premium "Glassmorphism" light theme, CSS Grids, and custom keyframe animations.
- **Icons & UI**: `lucide-react` for crisp, modern SVG icons.
- **Scanning**: `html5-qrcode` for robust barcode and QR reading.
- **Backend/Data**: Designed for **Firebase** (Firestore & Auth). *Currently running on a robust LocalStorage mock backend specifically configured for seamless, offline-capable hackathon demonstrations.*

---

## 🏃‍♂️ How to Run Locally

1. **Clone the repository** and navigate into the project directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🎯 Hackathon Demo Guide

We built specific features to ensure our hackathon pitch goes flawlessly:

1. **The Admin Bypass**: When presenting the Admin dashboard, simply click the **Admin** tab on the login screen. It will auto-fill the demo credentials (`admin@petipack.com` / `admin123`). Just click login!
2. **The "Demo Scan" Button**: Under the Barcode Scanner section, click the green **Demo Scan** button. This instantly simulates a successful camera scan (with audio feedback!) so you don't have to awkwardly hold a barcode up to your webcam on stage.
3. **Persistent Mock Data**: Refreshing the page won't wipe your data. Our LocalStorage engine keeps your demo products intact during the presentation.

---
*Built with ❤️ for the Hackathon!*
