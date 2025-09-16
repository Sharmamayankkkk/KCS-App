import React from 'react';

const ContactUs = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-gray-800 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl lg:text-4xl">
        Contact Us
      </h1>
      <p className="mb-4 text-base text-gray-700 sm:text-lg">
        We'd love to hear from you. If you have any questions about our services,
        live sessions, or contributions, feel free to reach out.
      </p>

      <div className="space-y-4 rounded-xl bg-white p-4 text-gray-800 shadow-md sm:p-6">
        <div>
          <span className="font-semibold">Email:</span>{' '}
          <a
            href="mailto:divineconnectionkcs@gmail.com"
            className="break-words text-blue-600 underline"
          >
            divineconnectionkcs@gmail.com
          </a>
        </div>
        <div>
          <span className="font-semibold">Address:</span>{' '}
          <p className="mt-1">
            Krishna Consciousness Society, F-408, Ghar Aangan Flats, Muhana Mandi,
            302029, Jaipur, Rajasthan.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
