import React, { forwardRef } from "react";
import { OrderData } from "@/lib/supabase";

interface InvoiceProps {
  order: any;
}

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      ref={ref}
      className="bg-white p-8 md:p-12 max-w-4xl mx-auto text-black font-sans"
      id="invoice-component"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <img
            src="/vishwalogo-v2.png"
            alt="Vishwa Lifestyle"
            className="h-16 mb-3"
            crossOrigin="anonymous"
          />
          <p className="text-sm text-gray-600">
            Shivpuri, Akkalkot Station Road,
            <br />
            Akkalkot 413216
            <br />
            GSTIN: 07AABCU9603R1Z2
            <br />
            crm@vishwaglobal.com
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-light text-gray-200 uppercase mb-4">
            Invoice
          </h2>
          <div className="space-y-1">
            <p className="font-medium">Invoice #: INV-{order.order_number}</p>
            <p className="text-sm text-gray-600">
              Date: {formatDate(order.created_at)}
            </p>
            <p className="text-sm text-gray-600">
              Order #: {order.order_number}
            </p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">
            Bill To
          </h3>
          <p className="font-medium">{order.shipping_address?.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {order.shipping_address?.line1}
            <br />
            {order.shipping_address?.line2 && (
              <>
                {order.shipping_address?.line2}
                <br />
              </>
            )}
            {order.shipping_address?.city}, {order.shipping_address?.state} -{" "}
            {order.shipping_address?.postal_code}
            <br />
            {order.shipping_address?.country}
            <br />
            Phone: {order.shipping_address?.phone || order.phone}
            <br />
            Email: {order.email}
          </p>
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">
            Ship To
          </h3>
          <p className="font-medium">{order.shipping_address?.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {order.shipping_address?.line1}
            <br />
            {order.shipping_address?.line2 && (
              <>
                {order.shipping_address?.line2}
                <br />
              </>
            )}
            {order.shipping_address?.city}, {order.shipping_address?.state} -{" "}
            {order.shipping_address?.postal_code}
            <br />
            {order.shipping_address?.country}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                Item
              </th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                Qty
              </th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                Price
              </th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {order.items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-50">
                <td className="py-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-gray-500 text-xs">
                    SKU: {item.sku || "N/A"}
                  </p>
                </td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">{formatPrice(item.price)}</td>
                <td className="py-4 text-right">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="text-red-500">-{formatPrice(order.discount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST</span>
            <span className="text-gray-500">Included</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-gray-100 pt-3 mt-3">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-500">
        <p className="mb-2">
          Thank you for choosing Vishwa Lifestyle for your spiritual journey.
        </p>
        <p>
          This is a computer generated invoice and does not require physical
          signature.
        </p>
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";

export default Invoice;
