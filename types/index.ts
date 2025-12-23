// ==========================================
// Product Types
// ==========================================
export interface Product {
  id: string;
  _id?: string; // Sanity ID
  slug: string;
  name: string;
  description: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  category: any; // Updated to any or more specific type if needed
  images: any[];
  features?: string[];
  inventory: number;
  tags?: string[];
  rating?: number;
  reviewCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  weight?: string;
  dimensions?: string;
  hsnCode?: string;
}

export interface ProductVariant {
  size: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export type ProductCategory =
  | 'agnihotra'
  | 'ritual'
  | 'lifestyle'
  | 'apparel'
  | 'home-decor'
  | 'combos';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
}

// ==========================================
// Cart Types
// ==========================================
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  maxQuantity: number;
  size?: string;
  variantSku?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
  promoCode?: string;
}

// ==========================================
// User Types
// ==========================================
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  defaultAddressId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

// ==========================================
// Order Types
// ==========================================
export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentId?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// ==========================================
// Checkout Types
// ==========================================
export interface CheckoutSession {
  id: string;
  cart: Cart;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: ShippingMethod;
  paymentMethod?: string;
  email?: string;
  step: CheckoutStep;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export type CheckoutStep =
  | 'cart'
  | 'information'
  | 'shipping'
  | 'payment'
  | 'confirmation';

// ==========================================
// Wishlist Types
// ==========================================
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  addedAt: string;
}

// ==========================================
// Review Types
// ==========================================
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
}

// ==========================================
// API Response Types
// ==========================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// Form Types
// ==========================================
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
  name?: string;
}

// ==========================================
// CCAvenue Types
// ==========================================
export interface CCAvenuePaymentDetails {
  merchant_id: string;
  order_id: string;
  amount: number;
  currency: string;
  redirect_url: string;
  cancel_url: string;
  language: string;
  billing_name?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  billing_tel?: string;
  billing_email?: string;
}

