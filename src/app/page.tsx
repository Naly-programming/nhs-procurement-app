// app/page.tsx
"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);

  return (
    <>
      {/* Video Hero (full-bleed) */}
      <section className="relative overflow-hidden w-screen left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] h-[50vh]">
        <video
          ref={videoRef}
          src="/coentry.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-70" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-5 leading-tight">
            Market penetration specialists.
          </h1>
          <p className="text-sm sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl">
            We help innovators break into regulated markets — fast.<br />
            From NHS procurement to private sector contracts, we shorten the path from product to partnership.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/signup"
              className="bg-white bg-opacity-90 text-primary px-6 py-3 sm:px-8 sm:py-4 rounded-lg shadow-md hover:bg-opacity-100 transition"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="bg-transparent border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-white hover:text-primary transition"
            >
              Book Demo
            </a>
          </div>
        </div>
      </section>

      {/* Continue rest of page content here */}
    </>
  );
}
