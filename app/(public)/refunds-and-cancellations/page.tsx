import React from 'react';

const RefundPolicy = () => {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-gray-800 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
        Refund Policy for Super Chat Contributions
      </h1>
      <p className="mb-10 text-center text-sm text-gray-500">Effective Date: May 5, 2025</p>

      <div className="space-y-8">
        {/* 1. Overview */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">1. Overview</h2>
          <p>
            Super Chat is a feature on{' '}
            <a
              href="https://meet.krishnaconsciousnesssociety.com"
              className="break-words text-blue-600 underline"
            >
              meet.krishnaconsciousnesssociety.com
            </a>{' '}
            that allows users to support content creators during live sessions by sending highlighted
            messages. These contributions are voluntary and processed via integrated payment
            gateways.
          </p>
        </section>

        {/* 2. Super Chat Packages */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">2. Super Chat Packages</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>₹25</strong> – Message highlighted for 30 seconds
            </li>
            <li>
              <strong>₹50</strong> – Message highlighted for 1 minute
            </li>
            <li>
              <strong>₹100</strong> – Message highlighted for 2 minutes
            </li>
            <li>
              <strong>₹250</strong> – Message highlighted for 6 minutes
            </li>
            <li>
              <strong>₹500</strong> – Message highlighted for 12 minutes
            </li>
            <li>
              <strong>₹1000</strong> – Message highlighted for 25 minutes
            </li>
            <li>
              <strong>₹5000</strong> – Message highlighted for 1 hour 10 minutes
            </li>
          </ul>
          <p className="mt-2 text-sm italic text-gray-500">
            Note: Each Super Chat message can contain a maximum of 200 characters.
          </p>
        </section>

        {/* 3. Non-Refundable Contributions */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">3. Non-Refundable Contributions</h2>
          <p>
            All Super Chat contributions are final and non-refundable. By contributing, you
            acknowledge that:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>The contribution is made voluntarily to support the content creator.</li>
            <li>Once processed, it cannot be refunded, reversed, or charged back.</li>
          </ul>
          <p className="mt-2 text-sm text-gray-500">
            This aligns with industry standards such as YouTube's Super Chat policy.
          </p>
        </section>

        {/* 4. Exceptions */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">4. Exceptions for Refunds</h2>
          <p>Refunds will only be considered under these exceptional cases:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>Technical Failures:</strong> Paid but not delivered due to server or gateway
              errors.
            </li>
            <li>
              <strong>Unauthorized Transactions:</strong> Made without your consent and proven with
              evidence.
            </li>
          </ul>
        </section>

        {/* 5. Refund Request Procedure */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">5. Refund Request Procedure</h2>
          <p>To request a refund, follow these steps:</p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>
              Email us at{' '}
              <a href="mailto:divineconnectionkcs@gmail.com" className="text-blue-600 underline">
                divineconnectionkcs@gmail.com
              </a>{' '}
              with the subject line <strong>"Super Chat Refund Request"</strong>.
            </li>
            <li>
              Include the following:
              <ul className="ml-5 mt-1 list-inside list-disc space-y-1">
                <li>Your registered email address</li>
                <li>Date and time of transaction</li>
                <li>Amount and payment method</li>
                <li>Transaction ID or reference number</li>
                <li>Screenshot of payment confirmation</li>
                <li>Detailed issue description</li>
              </ul>
            </li>
          </ol>
          <p className="mt-2 text-sm text-gray-500">
            Our team will respond within 7 business days. Submission doesn’t guarantee approval.
          </p>
        </section>

        {/* 6. Payment Methods */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">6. Payment Methods and Processing</h2>
          <p>We accept:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Credit/Debit Cards</li>
            <li>Unified Payments Interface (UPI)</li>
            <li>PayPal</li>
            <li>Other gateways on our platform</li>
          </ul>
          <p className="mt-2 text-sm text-gray-500">
            If approved, refunds will be processed back to the original payment method within 10
            business days.
          </p>
        </section>

        {/* 7. Contact Info */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-3 text-xl font-semibold">7. Contact Information</h2>
          <p>
            For questions or concerns, email us at{' '}
            <a href="mailto:divineconnectionkcs@gmail.com" className="text-blue-600 underline">
              divineconnectionkcs@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;