import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://czfbdjzkdqeqzzxerflk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vpeGouEiYdiZM85-N9lLPQ_tzStLcmE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class InventoryBackendService {
  
  // Transform DB snake_case to frontend camelCase
  _mapUser(u) {
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      masterKey: u.master_key,
      username: u.username,
      shopName: u.shop_name,
      address: u.address,
      isAdmin: u.is_admin,
      createdAt: u.created_at
    };
  }

  _mapProduct(p) {
    if (!p) return null;
    return {
      id: p.id,
      userId: p.user_id,
      barcode: p.barcode,
      name: p.name,
      brand: p.brand,
      price: Number(p.price),
      quantity: p.quantity,
      warehouse: p.warehouse,
      row: p.row,
      bin: p.bin,
      location: p.location,
      createdAt: p.created_at
    };
  }

  _mapMovement(m) {
    if (!m) return null;
    return {
      id: m.id,
      userId: m.user_id,
      timestamp: m.timestamp,
      type: m.type,
      productId: m.product_id,
      productName: m.product_name,
      quantity: m.quantity,
      location: m.location,
      details: m.details
    };
  }

  async register({ email, masterKey, username, shopName, address }) {
    const { data, error } = await supabase
      .from('shop_users')
      .insert([
        {
          email,
          master_key: masterKey,
          username,
          shop_name: shopName,
          address,
          is_admin: email.includes('admin')
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Email already registered');
      throw new Error(error.message);
    }
    return this._mapUser(data);
  }

  async login(email, password) {
    const { data, error } = await supabase
      .from('shop_users')
      .select('*')
      .eq('email', email)
      .eq('master_key', password)
      .single();

    if (error || !data) {
      throw new Error('Invalid email or Master Key');
    }
    return this._mapUser(data);
  }

  async logout() {
    // Custom auth uses local React state, no server-side logout needed
    return Promise.resolve();
  }

  async loadData(currentUser, isAdmin) {
    const result = { users: [], products: [], movements: [] };
    
    if (isAdmin) {
      const usersRes = await supabase.from('shop_users').select('*');
      const productsRes = await supabase.from('products').select('*');
      const movementsRes = await supabase.from('movements').select('*');
      
      if (usersRes.data) result.users = usersRes.data.map(this._mapUser);
      if (productsRes.data) result.products = productsRes.data.map(this._mapProduct);
      if (movementsRes.data) result.movements = movementsRes.data.map(this._mapMovement);
    } else if (currentUser) {
      const productsRes = await supabase.from('products').select('*').eq('user_id', currentUser.id);
      const movementsRes = await supabase.from('movements').select('*').eq('user_id', currentUser.id);
      
      if (productsRes.data) result.products = productsRes.data.map(this._mapProduct);
      if (movementsRes.data) result.movements = movementsRes.data.map(this._mapMovement);
    }
    
    return result;
  }

  async saveProduct(product) {
    // Supabase needs snake_case
    const dbProduct = {
      user_id: product.userId,
      barcode: product.barcode,
      name: product.name,
      brand: product.brand,
      price: product.price,
      quantity: product.quantity,
      warehouse: product.warehouse,
      row: product.row,
      bin: product.bin,
      location: product.location
    };
    
    let res;
    if (product.id && !product.id.startsWith('TRK-')) {
      // Update existing
      res = await supabase.from('products').update(dbProduct).eq('id', product.id).select().single();
    } else {
      // Insert new
      res = await supabase.from('products').insert([dbProduct]).select().single();
    }
    
    if (res.error) throw new Error(res.error.message);
    return this._mapProduct(res.data);
  }

  async saveMovement(movement) {
    const { data, error } = await supabase
      .from('movements')
      .insert([{
        user_id: movement.userId,
        type: movement.type,
        product_id: movement.productId && !movement.productId.startsWith('TRK-') ? movement.productId : null,
        product_name: movement.productName,
        quantity: movement.quantity,
        location: movement.location,
        details: movement.details
      }])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return this._mapMovement(data);
  }

  async completeSale(cart, discountPercent) {
    const updatedProducts = [];
    
    for (const item of cart) {
      // Fetch current stock
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.id)
        .single();
        
      if (fetchErr) throw new Error(`Could not verify stock for ${item.name}`);
      
      if (product.quantity < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      
      // Update stock
      const newQty = product.quantity - item.qty;
      const { data: updated, error: updateErr } = await supabase
        .from('products')
        .update({ quantity: newQty })
        .eq('id', item.id)
        .select()
        .single();
        
      if (updateErr) throw new Error(`Failed to update stock for ${item.name}`);
      
      updatedProducts.push(this._mapProduct(updated));
      
      // Log movement
      await supabase.from('movements').insert([{
        user_id: product.user_id,
        type: 'outward',
        product_id: product.id,
        product_name: product.name,
        quantity: item.qty,
        location: product.location,
        details: 'Sold via Billing'
      }]);
    }
    
    return { products: updatedProducts };
  }

  async deleteProduct(productId) {
    const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
    if (product) {
      await supabase.from('movements').insert([{
        user_id: product.user_id,
        type: 'outward',
        product_id: product.id,
        product_name: product.name,
        quantity: product.quantity,
        location: product.location,
        details: 'Product deleted'
      }]);
    }
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);
  }
}

export const InventoryBackend = new InventoryBackendService();
