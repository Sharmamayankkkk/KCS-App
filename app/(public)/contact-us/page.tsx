import React from 'react';

const ContactUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-800">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
        Contact Us
      </h1>
      <p className="text-gray-700 text-base sm:text-lg mb-4">
        We'd love to hear from you. If you have any questions about our services,
        live sessions, or contributions, feel free to reach out.
      </p>

      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 space-y-4 text-gray-800">
        <div>
          <span className="font-semibold">Email:</span>{' '}
          <a
            href="mailto:divineconnectionkcs@gmail.com"
            className="text-blue-600 underline break-words"
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
