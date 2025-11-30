// Shiprocket API Integration for Shipping
// Documentation: https://apidocs.shiprocket.in/

interface ShiprocketConfig {
  email: string;
  password: string;
}

let authToken: string | null = null;
let tokenExpiry: Date | null = null;

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';

// Get authentication token
async function getAuthToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured');
  }

  // Return cached token if still valid
  if (authToken && tokenExpiry && new Date() < tokenExpiry) {
    return authToken;
  }

  const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Shiprocket');
  }

  const data = await response.json();
  authToken = data.token;
  // Token valid for 10 days, but refresh after 9 days to be safe
  tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);

  return authToken!;
}

// Create shipment order
export async function createShipment(order: {
  orderNumber: string;
  orderDate: string;
  pickupLocation: string;
  billingCustomerName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingPhone: string;
  billingEmail: string;
  shippingIsBilling: boolean;
  items: Array<{
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
  }>;
  paymentMethod: 'Prepaid' | 'COD';
  subTotal: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}) {
  const token = await getAuthToken();

  const response = await fetch(`${SHIPROCKET_API_URL}/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      order_id: order.orderNumber,
      order_date: order.orderDate,
      pickup_location: order.pickupLocation,
      billing_customer_name: order.billingCustomerName,
      billing_address: order.billingAddress,
      billing_city: order.billingCity,
      billing_state: order.billingState,
      billing_pincode: order.billingPincode,
      billing_country: 'India',
      billing_phone: order.billingPhone,
      billing_email: order.billingEmail,
      shipping_is_billing: order.shippingIsBilling,
      order_items: order.items,
      payment_method: order.paymentMethod,
      sub_total: order.subTotal,
      length: order.length,
      breadth: order.breadth,
      height: order.height,
      weight: order.weight,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create shipment');
  }

  return response.json();
}

// Get shipping rates
export async function getShippingRates(params: {
  pickupPincode: string;
  deliveryPincode: string;
  weight: number;
  cod: boolean;
}) {
  const token = await getAuthToken();

  const response = await fetch(
    `${SHIPROCKET_API_URL}/courier/serviceability/?` +
    new URLSearchParams({
      pickup_postcode: params.pickupPincode,
      delivery_postcode: params.deliveryPincode,
      weight: params.weight.toString(),
      cod: params.cod ? '1' : '0',
    }),
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get shipping rates');
  }

  const data = await response.json();
  
  // Return available courier services with rates
  return data.data.available_courier_companies.map((courier: any) => ({
    id: courier.courier_company_id,
    name: courier.courier_name,
    rate: courier.rate,
    estimatedDays: courier.estimated_delivery_days,
    cod: courier.cod,
  }));
}

// Track shipment
export async function trackShipment(shipmentId: string) {
  const token = await getAuthToken();

  const response = await fetch(
    `${SHIPROCKET_API_URL}/courier/track/shipment/${shipmentId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to track shipment');
  }

  return response.json();
}

// Cancel shipment
export async function cancelShipment(orderIds: string[]) {
  const token = await getAuthToken();

  const response = await fetch(`${SHIPROCKET_API_URL}/orders/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ids: orderIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel shipment');
  }

  return response.json();
}

// Get pickup locations
export async function getPickupLocations() {
  const token = await getAuthToken();

  const response = await fetch(`${SHIPROCKET_API_URL}/settings/company/pickup`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get pickup locations');
  }

  return response.json();
}

// Generate AWB (Airway Bill) for shipment
export async function generateAWB(shipmentId: string, courierId: number) {
  const token = await getAuthToken();

  const response = await fetch(`${SHIPROCKET_API_URL}/courier/assign/awb`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipment_id: shipmentId,
      courier_id: courierId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AWB');
  }

  return response.json();
}

// Request pickup
export async function requestPickup(shipmentId: string) {
  const token = await getAuthToken();

  const response = await fetch(`${SHIPROCKET_API_URL}/courier/generate/pickup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipment_id: [shipmentId],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to request pickup');
  }

  return response.json();
}

// Generate shipping label
export async function generateLabel(shipmentIds: string[]) {
  const token = await getAuthToken();

  const response = await fetch(`${SHIPROCKET_API_URL}/courier/generate/label`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      shipment_id: shipmentIds,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate label');
  }

  return response.json();
}

// Generate invoice
export async function generateInvoice(orderIds: string[]) {
  const token = await getAuthToken();

  const response = await fetch(`${SHIPROCKET_API_URL}/orders/print/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      ids: orderIds,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate invoice');
  }

  return response.json();
}

