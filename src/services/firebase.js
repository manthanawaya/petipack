// src/services/firebase.js
// Mock Backend using LocalStorage for the Hackathon Demo
// Replaces real Firebase to avoid configuration issues

const STORAGE_KEY = 'petipack_demo_data';

function getStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return { users: [], products: [], movements: [] };
}

function setStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

class InventoryBackendService {
  async register({ email, masterKey, username, shopName, address }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getStorage();
        if (data.users.find(u => u.email === email)) {
          return reject(new Error('Email already registered'));
        }
        
        const newUser = {
          id: 'USER-' + Date.now(),
          email,
          masterKey, // storing plain text just for the local mock
          username,
          shopName,
          address,
          isAdmin: email.includes('admin'), // Simple mock admin logic
          createdAt: new Date().toISOString()
        };
        
        data.users.push(newUser);
        setStorage(data);
        resolve(newUser);
      }, 500);
    });
  }

  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getStorage();
        const user = data.users.find(u => u.email === email && u.masterKey === password);
        if (user) {
          resolve(user);
        } else {
          // Check for a hardcoded admin bypass for demo purposes
          if (email === 'admin@petipack.com' && password === 'admin123') {
             const adminUser = { id: 'ADMIN-1', email, isAdmin: true, shopName: 'System Admin', username: 'Admin' };
             resolve(adminUser);
          } else {
             reject(new Error('Invalid email or Master Key'));
          }
        }
      }, 500);
    });
  }

  async logout() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }

  async loadData(currentUser, isAdmin) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getStorage();
        const result = { users: [], products: [], movements: [] };
        
        if (isAdmin) {
          result.users = data.users;
          result.products = data.products;
          result.movements = data.movements;
        } else if (currentUser) {
          result.products = data.products.filter(p => p.userId === currentUser.id);
          result.movements = data.movements.filter(m => m.userId === currentUser.id);
        }
        
        resolve(result);
      }, 300);
    });
  }

  async saveProduct(product) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getStorage();
        const index = data.products.findIndex(p => p.id === product.id);
        if (index >= 0) {
          data.products[index] = product;
        } else {
          data.products.push(product);
        }
        setStorage(data);
        resolve(product);
      }, 200);
    });
  }

  async saveMovement(movement) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = getStorage();
        data.movements.push(movement);
        setStorage(data);
        resolve(movement);
      }, 200);
    });
  }

  async completeSale(cart, discountPercent) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const data = getStorage();
        const updatedProducts = [];
        
        for (const item of cart) {
          const pIndex = data.products.findIndex(p => p.id === item.id);
          if (pIndex >= 0) {
            const product = data.products[pIndex];
            if (product.quantity >= item.qty) {
              product.quantity -= item.qty;
              updatedProducts.push({ id: product.id, quantity: product.quantity });
              
              // Log movement
              data.movements.push({
                id: Date.now() + Math.random().toString(),
                userId: product.userId,
                timestamp: new Date().toISOString(),
                type: 'outward',
                productId: product.id,
                productName: product.name,
                quantity: item.qty,
                location: product.location || '',
                details: 'Sold via Billing'
              });
            } else {
              return reject(new Error(`Insufficient stock for ${product.name}`));
            }
          }
        }
        
        setStorage(data);
        resolve({ products: updatedProducts });
      }, 500);
    });
  }
}

export const InventoryBackend = new InventoryBackendService();
