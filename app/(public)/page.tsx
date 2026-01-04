import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KCS Meet | Spiritually Inspired Communication',
  description:
    "Welcome to KCS Meet, India's first spiritually inspired communication platform. Connect with your community, share your passion, and grow together.",
};

const HomePage = () => {
  return (
    <div className="w-full">
      <section className="relative bg-background py-20 md:py-32">
        <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:[mask-image:linear-gradient(180deg,black,rgba(0,0,0,0))]"></div>
        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">India&apos;s First</span>
            <span className="block text-accent">
              Spiritually Inspired Communication Platform
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary sm:text-xl md:text-2xl">
            Connect with your community, share your passion, and grow together.
            KCS Meet is more than a tool—it&apos;s a space for divine
            connections.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-pure-white shadow-md transition-all hover:bg-accent/90 hover:shadow-lg"
            >
              Get Started for Free
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center rounded-full bg-surface px-8 py-3.5 text-base font-semibold text-text-primary shadow-md ring-1 ring-inset ring-border transition-all hover:bg-background hover:shadow-lg"
            >
              See the Comparison <ArrowRight className="ml-2 size-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Built for Creators & Communities
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              Whether you&apos;re a spiritual leader, a yoga instructor, or a
              community organizer, KCS Meet provides the tools you need to
              thrive.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-background p-8 shadow-md border border-border">
              <h3 className="text-xl font-semibold text-text-primary">
                Monetize Your Passion
              </h3>
              <p className="mt-2 text-text-secondary">
                Engage your audience with Super Chat and offer exclusive content
                through tiered subscriptions. Your community supports you
                directly.
              </p>
            </div>
            <div className="rounded-2xl bg-background p-8 shadow-md border border-border">
              <h3 className="text-xl font-semibold text-text-primary">
                Broadcast to the World
              </h3>
              <p className="mt-2 text-text-secondary">
                Go live on YouTube and Facebook simultaneously, expanding your
                reach while keeping your community hub on KCS Meet.
              </p>
            </div>
            <div className="rounded-2xl bg-background p-8 shadow-md border border-border">
              <h3 className="text-xl font-semibold text-text-primary">
                Effortless & Accessible
              </h3>
              <p className="mt-2 text-text-secondary">
                No downloads needed. KCS Meet is web-first, making it easy for
                anyone to join your sessions from any device, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
