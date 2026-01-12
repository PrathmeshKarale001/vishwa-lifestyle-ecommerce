

export const metadata = {
  title: "Privacy Policy",
  description: "Vishwa Lifestyle Privacy Policy - How we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pt-24">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-serif mb-8">Privacy Policy</h1>
          <p className="text-foreground-muted mb-8">Last updated: November 2024</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">1. Information We Collect</h2>
              <p className="text-foreground-muted mb-4">
                At Vishwa Lifestyle, we collect information to provide better services to our customers.
                We collect information in the following ways:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li><strong>Personal Information:</strong> Name, email, phone number, shipping address</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay</li>
                <li><strong>Usage Data:</strong> Pages visited, products viewed, time spent on site</li>
                <li><strong>Device Information:</strong> Browser type, IP address, device type</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Improve our products and services</li>
                <li>Prevent fraudulent transactions</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">3. Data Security</h2>
              <p className="text-foreground-muted mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through Razorpay</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by employees</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">4. Cookies</h2>
              <p className="text-foreground-muted mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Remember your preferences and cart items</li>
                <li>Analyze site traffic and usage patterns</li>
                <li>Personalize your shopping experience</li>
              </ul>
              <p className="text-foreground-muted mt-4">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">5. Third-Party Services</h2>
              <p className="text-foreground-muted mb-4">
                We work with trusted third parties who may have access to your data:
              </p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Razorpay for payment processing</li>
                <li>Shipping partners for order delivery</li>
                <li>Google Analytics for website analytics</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">6. Your Rights</h2>
              <p className="text-foreground-muted mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-foreground-muted space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">7. Contact Us</h2>
              <p className="text-foreground-muted">
                If you have questions about this Privacy Policy or your personal data, please contact us at:
              </p>
              <p className="text-foreground-muted mt-4">
                <strong>Email:</strong> crm@vishwaglobal.com<br />
                <strong>Address:</strong> Sacred Valley, Rishikesh, Uttarakhand, India
              </p>
            </section>
          </div>
        </div>
      </div>


    </main>
  );
}

