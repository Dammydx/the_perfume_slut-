import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase configuration (Updated to new project)
const SUPABASE_URL = 'https://nywjctatolerrpfgtvrj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qd7SfnK3_VYAwbg1bfQ1PQ_-g7f3CHO';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'ddu7mxpbe';
const CLOUDINARY_UPLOAD_PRESET = 'perfume_preset'; // You need to create this in Cloudinary settings

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin authentication using Supabase Auth
export class AdminAuth {
  static async login(password) {
    // Use a hardcoded email for the dedicated admin user.
    // This keeps the login UI simple (password-only) while using
    // Supabase's real authentication to satisfy RLS policies.
    const adminEmail = 'admin@example.com';
    const { error } = await supabase.auth.signInWithPassword({ 
      email: adminEmail, 
      password 
    });
    
    if (error) {
      // Provide a more user-friendly error message
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'Invalid password. Please try again.' };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  static async logout() {
    await supabase.auth.signOut();
    window.location.href = 'admin-login.html';
  }

  static async requireAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      window.location.href = 'admin-login.html';
    }
  }
}

// Categories API
export class CategoriesAPI {
  static async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  static async create(name) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  static async update(id, name) {
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  static async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Products API
export class ProductsAPI {
  static async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(product => ({
      ...product,
      image_url: ProductsAPI.optimizeImageUrl(product.image_url)
    }));
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      image_url: ProductsAPI.optimizeImageUrl(data.image_url)
    };
  }

  static async create(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  static async update(id, product) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  static async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Error uploading to Cloudinary');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      throw error;
    }
  }

  static optimizeImageUrl(url) {
    if (!url) return url;
    if (url.includes('cloudinary.com')) {
      // Add auto optimization and format conversion
      // We also add a max width of 800px to save more bandwidth
      return url.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
    }
    return url;
  }
}

// Dashboard stats
export class DashboardAPI {
  static async getStats() {
    const [categoriesResult, productsResult, outOfStockResult] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' }).eq('in_stock', false)
    ]);

    if (categoriesResult.error || productsResult.error || outOfStockResult.error) {
        console.error("Error fetching stats:", categoriesResult.error || productsResult.error || outOfStockResult.error);
        return { totalCategories: 0, totalProducts: 0, outOfStockProducts: 0 };
    }

    return {
      totalCategories: categoriesResult.count || 0,
      totalProducts: productsResult.count || 0,
      outOfStockProducts: outOfStockResult.count || 0
    };
  }
}
