import React from 'react';

const ContactUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-700 text-lg mb-4">
        We'd love to hear from you. If you have any questions about our services,
        live sessions, or contributions, feel free to reach out.
      </p>

      <div className="bg-white shadow-md rounded-xl p-6 space-y-4 text-gray-800">
        <div>
          <span className="font-semibold">Email:</span>{' '}
          <a
            href="mailto:divineconnectionkcs@gmail.com"
            className="text-blue-600 underline"
          >
            divineconnectionkcs@gmail.com
          </a>
        </div>
        <div>
          <span className="font-semibold">Address:</span>{' '}
          Krishna Consciousness Society, F-408, Ghar Aangan Flats, Muhana Mandi, 302029, Jaipur, Rajasthan.
        </div>
      </div>
    </div>
  );
};

export default ContactUs;