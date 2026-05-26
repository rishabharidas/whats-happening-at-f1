"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function NavigationBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      // Find the hero section to calculate height dynamically
      const heroSection = document.getElementById("hero");
      const threshold = heroSection ? heroSection.offsetHeight - 200 : 100;

      if (window.scrollY > threshold) {
        setIsScrolled((prev) => {
          if (!prev) {
            // We just transitioned to scrolled! Set the initial top-right position
            const width = window.innerWidth;
            const isMd = width >= 768;
            const defaultX = width / 2 - (isMd ? 76 : 52);
            setDragOffset({ x: defaultX, y: 0 });
            dragOffsetRef.current = { x: defaultX, y: 0 };
          }
          return true;
        });
      } else {
        setIsScrolled(false);
        setIsMenuOpen(false); // Close the dock if we scroll back to top
        setDragOffset({ x: 0, y: 0 }); // Reset drag offsets when back at top
        dragOffsetRef.current = { x: 0, y: 0 };
        if (navRef.current) {
          navRef.current.style.transform = "";
          navRef.current.style.transition = "";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial run to determine state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Collapse dock when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Pointer event handlers for dragging the collapsed bubble
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (isScrolled && !isMenuOpen) {
      setIsDragging(true);
      hasMoved.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragOffsetRef.current = { ...dragOffset }; // Sync ref with current state

      // SYNCHRONOUSLY disable all transitions on the DOM element immediately
      if (navRef.current) {
        navRef.current.style.transition = "none";
      }

      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMoved.current = true;
    }

    const nextX = dragOffsetRef.current.x + dx;
    const nextY = dragOffsetRef.current.y + dy;

    const width = window.innerWidth;
    const isMd = width >= 768;
    const initialY = isMd ? 32 : 24;

    // Clamp coordinates relative to the left-1/2 anchor line
    const minX = 44 - width / 2;
    const maxX = width / 2 - 44;
    const clampedX = Math.max(minX, Math.min(maxX, nextX));
    const clampedY = Math.max(
      16 - initialY,
      Math.min(window.innerHeight - initialY - 72, nextY),
    );

    dragOffsetRef.current = { x: clampedX, y: clampedY };

    // Update the DOM transform directly (note: must include the baseline translateX(-50%))
    if (navRef.current) {
      navRef.current.style.transform = `translateX(-50%) translate(${clampedX}px, ${clampedY}px)`;
    }

    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);

      // Restore normal transition behavior in the DOM
      if (navRef.current) {
        navRef.current.style.transition = "";
      }

      // Save the final drag coordinates to React state to trigger a single re-render
      setDragOffset(dragOffsetRef.current);

      if (!hasMoved.current) {
        // Tap/click trigger: open the dock menu
        setIsMenuOpen(true);
      }
    }
  };

  // Smooth scroll handler for anchor links
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMenuOpen(false);

      // If we are on the homepage, scroll smoothly
      const element = document.getElementById(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        // If not on homepage, navigate to homepage with hash
        window.location.href = `/${href}`;
      }
    }
  };

  // Compute transform styles based on active layout states
  const getTransformStyle = (): string | undefined => {
    if (typeof window === "undefined" || !isScrolled) {
      return undefined;
    }

    const width = window.innerWidth;
    const isMd = width >= 768;
    const initialY = isMd ? 32 : 24;

    if (isMenuOpen) {
      // Expanded dock state: Calculate anti-collision clamping boundaries to fit screen beautifully
      let dockWidth = width * 0.85;
      if (width >= 640 && width < 768) dockWidth = 480;
      if (width >= 768) dockWidth = 580;

      const halfRemaining = width / 2 - dockWidth / 2;
      const minX = 16 - halfRemaining;
      const maxX = halfRemaining - 16;

      const clampedX = Math.max(minX, Math.min(maxX, dragOffset.x));
      const clampedY = Math.max(
        16 - initialY,
        Math.min(window.innerHeight - initialY - 72, dragOffset.y),
      );

      return `translateX(-50%) translate(${clampedX}px, ${clampedY}px)`;
    }

    // Collapsed bubble state: clamp coordinate offsets dynamically
    const minX = 44 - width / 2;
    const maxX = width / 2 - 44;
    const clampedX = Math.max(minX, Math.min(maxX, dragOffset.x));
    const clampedY = Math.max(
      16 - initialY,
      Math.min(window.innerHeight - initialY - 72, dragOffset.y),
    );

    return `translateX(-50%) translate(${clampedX}px, ${clampedY}px)`;
  };

  const transformStyle = getTransformStyle();

  return (
    <nav
      id="main-nav"
      ref={navRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={transformStyle ? { transform: transformStyle } : undefined}
      className={`fixed z-[999] top-6 md:top-8 left-1/2 flex items-center touch-none select-none
        ${isDragging ? "transition-none" : "transition-[width,height,background-color,border-color,box-shadow,transform,opacity] duration-300 ease-in-out"}
        ${
          !isScrolled
            ? "w-4/5 max-w-5xl h-14 rounded-full bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-white justify-between px-6 shadow-xl -translate-x-1/2"
            : isMenuOpen
              ? "w-[85vw] sm:w-[480px] md:w-[580px] h-14 rounded-full bg-zinc-950/90 backdrop-blur-md border border-gray-300 text-white justify-between px-6 shadow-2xl"
              : "w-14 h-14 rounded-full bg-red-600 border border-gray-300 shadow-xl shadow-red-600/30 cursor-grab active:cursor-grabbing justify-center"
        }
      `}
    >
      {/* Logo: Visible in Wide and Dock states */}
      <div
        className={`transition-[opacity,transform] duration-300 flex items-center ${
          isScrolled && !isMenuOpen
            ? "opacity-0 scale-75 pointer-events-none absolute"
            : "opacity-100 scale-100"
        }`}
      >
        <Link
          href="/"
          className="uppercase font-extrabold italic font-mono text-white hover:text-red-500 transition-colors"
        >
          WH@F1
        </Link>
      </div>

      {/* Nav Links: Visible in Wide and Dock states */}
      <div
        className={`flex items-center transition-[opacity,transform] duration-300 ${
          isScrolled && !isMenuOpen
            ? "opacity-0 scale-75 pointer-events-none absolute"
            : "opacity-100 scale-100"
        } ${
          isScrolled && isMenuOpen
            ? "gap-3 sm:gap-5 font-mono font-medium text-xs sm:text-sm text-zinc-300"
            : "gap-3 font-mono font-light text-sm text-zinc-300"
        }`}
      >
        <a
          href="#last-race-results"
          onClick={(e) => handleAnchorClick(e, "#last-race-results")}
          className="hover:text-red-500 transition-colors"
        >
          results
        </a>
        <a
          href="#drivers-standings"
          onClick={(e) => handleAnchorClick(e, "#drivers-standings")}
          className="hover:text-red-500 transition-colors"
        >
          drivers
        </a>
        <a
          href="#upcoming-session"
          onClick={(e) => handleAnchorClick(e, "#upcoming-session")}
          className="hover:text-red-500 transition-colors"
        >
          upcoming
        </a>
        {/* <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors hidden sm:inline-block">github</a> */}
      </div>

      {/* Bubble Icon (Hamburger): Visible ONLY in Bubble state */}
      <div
        className={`transition-[opacity,transform] duration-300 ${
          isScrolled && !isMenuOpen
            ? "opacity-100 scale-100 flex items-center justify-center"
            : "opacity-0 scale-50 pointer-events-none absolute"
        }`}
      >
        <svg
          className="w-6 h-6 text-white pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>

      {/* Dock Close Icon: Visible ONLY in Dock state */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(false);
        }}
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag triggering on button click
        className={`transition-[opacity,transform,color] duration-300 hover:text-red-500 active:scale-95 cursor-pointer ${
          isScrolled && isMenuOpen
            ? "opacity-100 scale-100 flex items-center justify-center"
            : "opacity-0 scale-50 pointer-events-none absolute"
        }`}
        aria-label="Close dock"
      >
        <svg
          className="w-5 h-5 text-zinc-400 hover:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </nav>
  );
}
