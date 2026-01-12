# Project Overview

This document provides a detailed breakdown of the Vishwa Lifestyle project, including the repository structure, CMS schemas, checkout implementation, and admin logic.

## 1. Repository Structure

```
/
├── app/                        # Next.js App Router
│   ├── admin/                  # Custom Admin Dashboard
│   ├── api/                    # API Routes (Auth, Checkout, Webhooks)
│   ├── auth/                   # Authentication Pages (Login, Sign up)
│   ├── checkout/               # Checkout Page
│   ├── shop/                   # Shop & Product Pages
│   └── ...
├── components/                 # React UI Components
│   ├── Header.tsx              # Main Navigation
│   ├── Footer.tsx              # Footer
│   ├── ProductCard.tsx         # Product Display
│   └── ...
├── lib/                        # Utility Functions & Config
│   ├── sanity.ts               # Sanity Client & Queries
│   ├── supabase.ts             # Supabase Client
│   ├── razorpay.ts             # Payment Gateway Logic
│   └── ...
├── sanity/                     # Sanity Studio Configuration
│   ├── components/             # Custom Studio Components (e.g., Selectors)
│   ├── schemaTypes/            # Content Models
│   │   ├── documents/          # Content Schemas (Product, Category)
│   │   └── ...
│   └── ...
└── ...
```

## 2. CMS Schemas

The content models are defined in Sanity using TypeScript.

### **Product Schema** (`sanity/schemaTypes/documents/product.ts`)
This schema defines the product structure, including custom components for Sub-Category and Segment selection to ensure data integrity.

```typescript
import { type SchemaTypeDefinition } from 'sanity';
import { SubCategorySelect } from '../../components/SubCategorySelect';
import { SegmentSelect } from '../../components/SegmentSelect';

const product: SchemaTypeDefinition = {
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        // ... (Slug, SKU, Images, Price)
        {
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }],
        },
        {
            name: 'subCategory',
            title: 'Sub-Category',
            type: 'string',
            components: {
                input: SubCategorySelect
            },
            validation: (Rule) => Rule.custom((value, context) => {
                const parent: any = context.parent;
                if (parent?.category && !value) {
                    return 'Sub-Category is required when Category is selected';
                }
                return true;
            })
        },
        {
            name: 'segments',
            title: 'Segments',
            type: 'string',
            components: {
                input: SegmentSelect
            },
        },
        {
            name: 'inventory',
            title: 'Inventory',
            type: 'number',
            validation: (Rule) => Rule.min(0),
        },
        // ... (SEO, Variants, Details)
    ],
};
export default product;
```

### **Category Schema** (`sanity/schemaTypes/documents/category.ts`)
This schema defines categories and the mapping between sub-categories and their segments.

```typescript
import { type SchemaTypeDefinition } from 'sanity';
import { SubCategoryNameSelect } from '../../components/SubCategoryNameSelect';

const category: SchemaTypeDefinition = {
    name: 'category',
    title: 'Category',
    type: 'document',
    fields: [
        { name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() },
        { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
        {
            name: 'subCategories',
            title: 'Sub-Categories',
            type: 'array',
            of: [{ type: 'string' }],
        },
        {
            name: 'categorySegments',
            title: 'Sub-Category Segments mapping',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'subCategoryName',
                            title: 'Sub-Category Name',
                            type: 'string',
                            components: { input: SubCategoryNameSelect },
                            validation: (Rule) => Rule.required(),
                        },
                        {
                            name: 'segments',
                            title: 'Segments',
                            type: 'array',
                            of: [{ type: 'string' }],
                            validation: (Rule) => Rule.required(),
                        },
                    ],
                },
            ],
        },
    ],
};
export default category;
```

## 3. Checkout + Payment Files

The project currently uses **Razorpay** for payments.

### **Payment Utility** (`lib/razorpay.ts`)
Handles server-side order creation and signature verification.

```typescript
import Razorpay from 'razorpay';
import { log } from './logger';

export async function createRazorpayOrder(options: { amount: number; receipt: string; notes?: any }) {
    try {
        const client = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        
        const order = await client.orders.create({
            amount: Math.round(options.amount * 100), // Amount in paise
            currency: 'INR',
            receipt: options.receipt,
            notes: options.notes,
        });

        return { success: true, order };
    } catch (error: any) {
        log.error('Razorpay order creation failed', error);
        return { success: false, error: error.message };
    }
}
```

### **Checkout API Route** (`app/api/checkout/route.ts`)
Validates cart data, creates a pending order in Supabase, and initiates the Razorpay order.

```typescript
export async function POST(request: NextRequest) {
    // ... Rate Limiting & Input Sanitization ...

  try {
    const body = await request.json();
    // ... Destructure body ...

    // Generate Order Number
    const orderNumber = generateOrderNumber();

    // Create Razorpay Order
    const razorpayResult = await createRazorpayOrder({
      amount: total,
      receipt: orderNumber,
      notes: { email, orderNumber, promoCode },
    });

    // Create Supabase Order Record (Pending)
    const { createServerClient } = await import('@/lib/supabase');
    const supabaseAdmin = createServerClient();
    
    await supabaseAdmin.from('orders').insert({
        order_number: orderNumber,
        items,
        total,
        shipping_address: shippingAddress,
        razorpay_order_id: razorpayResult.order.id,
        status: 'pending',
        payment_status: 'pending',
        // ...
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      amount: total,
      currency: 'INR',
      razorpayOrderId: razorpayResult.order.id,
    });
  } catch (error) {
     // Error handling
  }
}
```

### **Frontend Checkout Page** (`app/checkout/page.tsx`)
A multi-step checkout form (Information -> Shipping -> Payment).

```tsx
// ... Imports ...

export default function CheckoutPage() {
  // ... State for steps, shipping data ...
  
  const handlePayment = async () => {
    // 1. Call API to create order
    const response = await fetch("/api/checkout", { /* ... */ });
    const data = await response.json();

    // 2. Open Razorpay Modal
    const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
             // 3. Verify Payment on Success
             await fetch("/api/verify-payment", { /* ... */ });
             router.push(`/checkout/success?orderNumber=${data.orderNumber}`);
        },
        // ...
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // ... Render Logic for Multi-step Form ...
}
```

## 4. Admin Panel Logic

The admin panel is built as a custom dashboard within the Next.js app (`/admin`), secured by Supabase Auth and Row Level Security.

### **Dashboard Logic** (`app/admin/page.tsx`)
It aggregates data from multiple Supabase tables (`orders`, `profiles`, `reviews`, `inventory`) to provide a real-time overview.

```tsx
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchDashboardData = async () => {
      // 1. Fetch Orders
      const { data: allOrders } = await supabase.from("orders").select("id, total, status, created_at");
      
      // 2. Fetch Customers
      const { data: allCustomers } = await supabase.from("profiles").select("id, created_at");

      // 3. Fetch Inventory (Low Stock)
      const { data: allInventory } = await supabase.from("inventory").select("*").eq("is_tracked", true);
      const lowStockData = allInventory?.filter(i => i.quantity <= i.low_stock_threshold);

      // 4. Calculate Stats
      setStats({
          totalOrders: allOrders.length,
          totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0),
          lowStockItems: lowStockData.length,
          // ...
      });
  };

  // ... Render Charts & Stats Cards ...
}
```

### **Security**
Access is controlled via an `isAdmin()` check in `lib/admin.ts` which verifies if the current user has the 'admin' role in the database.
