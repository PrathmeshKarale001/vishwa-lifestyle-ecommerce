import { act, renderHook } from '@testing-library/react';
import { useCartStore } from '@/store/cart';

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  it('should start with an empty cart', () => {
    const { result } = renderHook(() => useCartStore());
    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    const testItem = {
      id: 'test-1',
      productId: 'product-1',
      name: 'Agnihotra Kit',
      price: 2100,
      image: 'https://example.com/image.jpg',
      slug: 'agnihotra-kit',
      maxQuantity: 10,
    };

    act(() => {
      result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Agnihotra Kit');
    expect(result.current.itemCount).toBe(1);
  });

  it('should increase quantity when adding same item', () => {
    const { result } = renderHook(() => useCartStore());
    
    const testItem = {
      id: 'test-1',
      productId: 'product-1',
      name: 'Agnihotra Kit',
      price: 2100,
      image: 'https://example.com/image.jpg',
      slug: 'agnihotra-kit',
      maxQuantity: 10,
    };

    act(() => {
      result.current.addItem(testItem);
      result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    const testItem = {
      id: 'test-1',
      productId: 'product-1',
      name: 'Agnihotra Kit',
      price: 2100,
      image: 'https://example.com/image.jpg',
      slug: 'agnihotra-kit',
      maxQuantity: 10,
    };

    act(() => {
      result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.removeItem('product-1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore());
    
    const testItem = {
      id: 'test-1',
      productId: 'product-1',
      name: 'Agnihotra Kit',
      price: 2100,
      image: 'https://example.com/image.jpg',
      slug: 'agnihotra-kit',
      maxQuantity: 10,
    };

    act(() => {
      result.current.addItem(testItem);
    });

    act(() => {
      result.current.updateQuantity('product-1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);
  });

  it('should calculate totals correctly', () => {
    const { result } = renderHook(() => useCartStore());
    
    const testItem = {
      id: 'test-1',
      productId: 'product-1',
      name: 'Agnihotra Kit',
      price: 1000,
      image: 'https://example.com/image.jpg',
      slug: 'agnihotra-kit',
      maxQuantity: 10,
    };

    act(() => {
      result.current.addItem({ ...testItem, quantity: 2 });
    });

    expect(result.current.subtotal).toBe(2000);
    // Shipping should be 0 for orders >= 999
    expect(result.current.shipping).toBe(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    const testItem = {
      id: 'test-1',
      productId: 'product-1',
      name: 'Agnihotra Kit',
      price: 2100,
      image: 'https://example.com/image.jpg',
      slug: 'agnihotra-kit',
      maxQuantity: 10,
    };

    act(() => {
      result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('should toggle cart open/close', () => {
    const { result } = renderHook(() => useCartStore());
    
    expect(result.current.isCartOpen).toBe(false);

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isCartOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });

    expect(result.current.isCartOpen).toBe(false);

    act(() => {
      result.current.toggleCart();
    });

    expect(result.current.isCartOpen).toBe(true);
  });
});

