
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
      <section className="relative py-20 md:py-32 bg-[#F8FAFC]">
        <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-[#0F172A]">
            <span className="block">India's First</span>
            <span className="block text-[#B91C1C]">Spiritually Inspired Communication Platform</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-[#64748B]">
            Connect with your community, share your passion, and grow together. KCS Meet is more than a tool—it's a space for divine connections.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg bg-[#B91C1C] hover:bg-[#991B1B]">
              Get Started for Free
            </Link>
            <Link href="/compare" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-base font-semibold shadow-md ring-1 ring-inset transition-all hover:shadow-lg text-[#0F172A] ring-[#E2E8F0] hover:bg-[#F8FAFC]">
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
