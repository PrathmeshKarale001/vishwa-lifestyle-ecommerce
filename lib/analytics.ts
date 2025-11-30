// E-commerce Analytics Tracking
// Google Analytics 4 E-commerce Events

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Check if gtag is available
const isGtagAvailable = () => typeof window !== 'undefined' && window.gtag;

// Track page view
export const trackPageView = (url: string, title?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
  });
};

// Track product view
export const trackViewItem = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
}) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'view_item', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_category: product.category || 'Products',
      item_brand: product.brand || 'Vishwa Lifestyle',
    }],
  });
};

// Track add to cart
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'add_to_cart', {
    currency: 'INR',
    value: product.price * product.quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: product.quantity,
      item_category: product.category || 'Products',
      item_brand: 'Vishwa Lifestyle',
    }],
  });
};

// Track remove from cart
export const trackRemoveFromCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'remove_from_cart', {
    currency: 'INR',
    value: product.price * product.quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: product.quantity,
      item_brand: 'Vishwa Lifestyle',
    }],
  });
};

// Track view cart
export const trackViewCart = (items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>, total: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'view_cart', {
    currency: 'INR',
    value: total,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_brand: 'Vishwa Lifestyle',
    })),
  });
};

// Track begin checkout
export const trackBeginCheckout = (items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>, total: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'begin_checkout', {
    currency: 'INR',
    value: total,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_brand: 'Vishwa Lifestyle',
    })),
  });
};

// Track checkout step (shipping, payment, etc.)
export const trackCheckoutStep = (step: number, option?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'checkout_progress', {
    checkout_step: step,
    checkout_option: option,
  });
};

// Track add payment info
export const trackAddPaymentInfo = (paymentMethod: string, total: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'add_payment_info', {
    currency: 'INR',
    value: total,
    payment_type: paymentMethod,
  });
};

// Track add shipping info
export const trackAddShippingInfo = (shippingMethod: string, total: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'add_shipping_info', {
    currency: 'INR',
    value: total,
    shipping_tier: shippingMethod,
  });
};

// Track purchase
export const trackPurchase = (order: {
  orderId: string;
  total: number;
  tax: number;
  shipping: number;
  coupon?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }>;
}) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'purchase', {
    transaction_id: order.orderId,
    currency: 'INR',
    value: order.total,
    tax: order.tax,
    shipping: order.shipping,
    coupon: order.coupon,
    items: order.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_category: item.category || 'Products',
      item_brand: 'Vishwa Lifestyle',
    })),
  });
};

// Track refund
export const trackRefund = (orderId: string, amount: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'refund', {
    transaction_id: orderId,
    currency: 'INR',
    value: amount,
  });
};

// Track add to wishlist
export const trackAddToWishlist = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'add_to_wishlist', {
    currency: 'INR',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_category: product.category || 'Products',
      item_brand: 'Vishwa Lifestyle',
    }],
  });
};

// Track search
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

// Track share
export const trackShare = (method: string, contentType: string, itemId: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'share', {
    method,
    content_type: contentType,
    item_id: itemId,
  });
};

// Track sign up
export const trackSignUp = (method: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'sign_up', {
    method,
  });
};

// Track login
export const trackLogin = (method: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'login', {
    method,
  });
};

// Track newsletter subscription
export const trackNewsletterSignup = (source: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'newsletter_signup', {
    source,
  });
};

// Track error
export const trackError = (errorMessage: string, errorLocation: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag?.('event', 'exception', {
    description: errorMessage,
    location: errorLocation,
    fatal: false,
  });
};

// ==========================================
// DATABASE ANALYTICS (Server-side tracking)
// ==========================================

/**
 * Track event to database
 */
export async function trackEventToDatabase(event: {
  event_type: string;
  event_name: string;
  user_id?: string;
  session_id?: string;
  page_path?: string;
  page_title?: string;
  properties?: Record<string, any>;
}) {
  try {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error('Failed to track event to database');
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Track page view to database
 */
export function trackPageViewToDB(path: string, title?: string) {
  if (typeof window === 'undefined') return;

  const sessionId = sessionStorage.getItem('session_id') || 
                    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  if (!sessionStorage.getItem('session_id')) {
    sessionStorage.setItem('session_id', sessionId);
  }

  trackEventToDatabase({
    event_type: 'page_view',
    event_name: 'page_view',
    session_id: sessionId,
    page_path: path,
    page_title: title || document.title,
  });
}

/**
 * Track e-commerce event to database
 */
export function trackEcommerceEventToDB(
  eventName: string,
  properties: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  const sessionId = sessionStorage.getItem('session_id') || 
                    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  trackEventToDatabase({
    event_type: 'ecommerce',
    event_name: eventName,
    session_id: sessionId,
    page_path: window.location.pathname,
    page_title: document.title,
    properties,
  });
}

