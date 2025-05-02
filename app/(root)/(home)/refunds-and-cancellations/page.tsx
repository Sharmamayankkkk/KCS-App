import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Refund Policy for Super Chat Contributions</h1>
      <p className="mb-6 text-sm text-gray-500">Effective Date: May 1, 2025</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
        <p>
          Super Chat is a feature on <a href="https://meet.krishnaconsciousnesssociety.com" className="text-blue-600 underline"> meet.krishnaconsciousnesssociety.com</a> 
          that allows users to support content creators during live sessions by sending highlighted messages. These contributions are voluntary and processed via integrated payment gateways.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Super Chat Packages</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>₹50</strong> – Message highlighted for 30 Seconds</li>
          <li><strong>₹100</strong> – Message highlighted for 1 minute</li>
          <li><strong>₹200</strong> – Message highlighted for 2 minutes</li>
          <li><strong>₹500</strong> – Message highlighted for 3 minutes</li>
          <li><strong>₹1000</strong> – Message highlighted for 5 minutes</li>
        </ul>
        <p className="mt-2 italic">Note: Each Super Chat message can contain a maximum of 200 characters.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Non-Refundable Contributions</h2>
        <p>
          All Super Chat contributions are final and non-refundable. By contributing, you acknowledge that:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>The contribution is made voluntarily to support the content creator.</li>
          <li>Once processed, it cannot be refunded, reversed, or charged back.</li>
        </ul>
        <p className="mt-2">This aligns with industry standards such as YouTube's Super Chat policy.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Exceptions for Refunds</h2>
        <p>Refunds will only be considered under these exceptional cases:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Technical Failures:</strong> The Super Chat was paid but not delivered due to server or gateway errors.</li>
          <li><strong>Unauthorized Transactions:</strong> If a contribution was made without your consent and you can show evidence.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Refund Request Procedure</h2>
        <p>To request a refund, follow these steps:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Email us at <a href="mailto:divineconnectionkcs@gmail.com" className="text-blue-600 underline">divineconnectionkcs@gmail.com</a> with subject line <strong>"Super Chat Refund Request"</strong>.</li>
          <li>Include the following in your message:
            <ul className="list-disc list-inside ml-5 mt-1 space-y-1">
              <li>Your registered email address</li>
              <li>Date and time of transaction</li>
              <li>Amount and payment method</li>
              <li>Transaction ID or reference number</li>
              <li>Screenshot of payment confirmation</li>
              <li>Detailed issue description</li>
            </ul>
          </li>
        </ol>
        <p className="mt-2">Our team will review and respond within 7 business days. Submission does not guarantee approval.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Payment Methods and Processing</h2>
        <p>We accept:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Credit/Debit Cards</li>
          <li>Unified Payments Interface (UPI)</li>
          <li>PayPal</li>
          <li>Other gateways on our platform</li>
        </ul>
        <p className="mt-2">If approved, refunds will be processed back to the original payment method and may take up to 10 business days.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">7. Contact Information</h2>
        <p>For questions or concerns, email us at <a href="mailto:divineconnectionkcs@gmail.com" className="text-blue-600 underline">divineconnectionkcs@gmail.com</a>.</p>
      </section>
    </div>
  );
};

export default RefundPolicy;
