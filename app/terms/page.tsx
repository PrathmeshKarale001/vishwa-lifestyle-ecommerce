import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service",
  description: "Vishwa Lifestyle Terms of Service - Rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif mb-8">Terms of Service</h1>
          <p className="text-foreground-muted mb-8">Last updated: November 2024</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">1. Acceptance of Terms</h2>
              <p className="text-foreground-muted">
                By accessing and using Vishwa Lifestyle ("the Website"), you agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use our 
                services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">2. Products and Services</h2>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>All products are subject to availability</li>
                <li>We reserve the right to modify or discontinue products without notice</li>
                <li>Product images are for illustration purposes; actual products may vary slightly</li>
                <li>Prices are in Indian Rupees (INR) and include applicable taxes</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">3. Orders and Payment</h2>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Orders are confirmed upon successful payment</li>
                <li>We accept payments via Razorpay (UPI, Cards, Net Banking, Wallets)</li>
                <li>All payments are processed securely</li>
                <li>We reserve the right to cancel orders for any reason</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">4. Shipping and Delivery</h2>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>We ship within India only (currently)</li>
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Shipping charges apply for orders below ₹999</li>
                <li>Risk of loss passes to you upon delivery</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">5. Returns and Refunds</h2>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Returns accepted within 7 days of delivery</li>
                <li>Products must be unused and in original packaging</li>
                <li>Perishable items (ghee, etc.) are non-returnable</li>
                <li>Refunds processed within 7-10 business days</li>
                <li>Shipping costs for returns are borne by the customer</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">6. User Accounts</h2>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>You are responsible for maintaining account security</li>
                <li>One account per person</li>
                <li>Accurate information must be provided</li>
                <li>We may suspend accounts for violations</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">7. Intellectual Property</h2>
              <p className="text-foreground-muted">
                All content on this website, including text, images, logos, and designs, is the 
                property of Vishwa Lifestyle and protected by copyright laws. You may not reproduce, 
                distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">8. Limitation of Liability</h2>
              <p className="text-foreground-muted">
                Vishwa Lifestyle shall not be liable for any indirect, incidental, special, or 
                consequential damages arising from your use of our products or services. Our 
                liability is limited to the purchase price of the products.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">9. Governing Law</h2>
              <p className="text-foreground-muted">
                These Terms shall be governed by the laws of India. Any disputes shall be resolved 
                in the courts of Uttarakhand, India.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">10. Contact</h2>
              <p className="text-foreground-muted">
                For questions about these Terms, contact us at:<br />
                <strong>Email:</strong> legal@vishwalifestyle.com
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

