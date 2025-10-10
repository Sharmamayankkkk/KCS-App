
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KCS Meet | Spiritually Inspired Communication',
  description: 'Welcome to KCS Meet, India\'s first spiritually inspired communication platform. Connect with your community, share your passion, and grow together.',
};

const HomePage = () => {
  return (
    <div className="w-full">
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-50 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">India's First</span>
            <span className="block text-blue-600">Spiritually Inspired Communication Platform</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 sm:text-xl md:text-2xl">
            Connect with your community, share your passion, and grow together. KCS Meet is more than a tool—it's a space for divine connections.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-transform transform hover:scale-105">
              Get Started for Free
            </Link>
            <Link href="/compare" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-semibold text-gray-900 shadow-lg ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-transform transform hover:scale-105">
              See the Comparison <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Built for Creators & Communities</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Whether you're a spiritual leader, a yoga instructor, or a community organizer, KCS Meet provides the tools you need to thrive.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 bg-gray-50 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-900">Monetize Your Passion</h3>
              <p className="mt-2 text-gray-600">Engage your audience with Super Chat and offer exclusive content through tiered subscriptions. Your community supports you directly.</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-900">Broadcast to the World</h3>
              <p className="mt-2 text-gray-600">Go live on YouTube and Facebook simultaneously, expanding your reach while keeping your community hub on KCS Meet.</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-900">Effortless & Accessible</h3>
              <p className="mt-2 text-gray-600">No downloads needed. KCS Meet is web-first, making it easy for anyone to join your sessions from any device, anywhere.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
