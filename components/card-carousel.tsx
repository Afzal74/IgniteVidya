'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

interface CardCarouselProps {
  items: Array<{
    id: string | number;
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    image?: string;
  }>;
}

export default function CardCarousel({ items }: CardCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const iterationRef = useRef(0);
  const scrubRef = useRef<any>(null);
  const seamlessLoopRef = useRef<any>(null);

  useEffect(() => {
    if (!cardsContainerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const spacing = 0.1;
    const snap = gsap.utils.snap(spacing);
    const cards = gsap.utils.toArray('.carousel-card') as HTMLElement[];

    if (cards.length === 0) return;

    // Build seamless loop
    const buildSeamlessLoop = () => {
      const overlap = Math.ceil(1 / spacing);
      const startTime = cards.length * spacing + 0.5;
      const loopTime = (cards.length + overlap) * spacing + 1;
      const rawSequence = gsap.timeline({ paused: true });
      const seamlessLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        onRepeat() {
          if (this._time === this._dur) {
            this._tTime += this._dur - 0.01;
          }
        },
      });

      const l = cards.length + overlap * 2;
      let time = 0;

      gsap.set(cards, { xPercent: 300, opacity: 0, scale: 0 });

      for (let i = 0; i < l; i++) {
        const index = i % cards.length;
        const item = cards[index];
        time = i * spacing;

        rawSequence.fromTo(
          item,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            zIndex: 100,
            duration: 0.5,
            yoyo: true,
            repeat: 1,
            ease: 'power1.in',
            immediateRender: false,
          },
          time
        );

        rawSequence.fromTo(
          item,
          { xPercent: 300 },
          { xPercent: -300, duration: 1, ease: 'none', immediateRender: false },
          time
        );
      }

      rawSequence.time(startTime);
      seamlessLoop.to(rawSequence, {
        time: loopTime,
        duration: loopTime - startTime,
        ease: 'none',
      });

      seamlessLoop.fromTo(
        rawSequence,
        { time: overlap * spacing + 1 },
        {
          time: startTime,
          duration: startTime - (overlap * spacing + 1),
          immediateRender: false,
          ease: 'none',
        }
      );

      return { seamlessLoop, startTime, loopTime };
    };

    const { seamlessLoop, startTime, loopTime } = buildSeamlessLoop();
    seamlessLoopRef.current = seamlessLoop;

    scrubRef.current = gsap.to(seamlessLoop, {
      totalTime: 0,
      duration: 0.5,
      ease: 'power3',
      paused: true,
    });

    const scrubTo = (totalTime: number) => {
      let progress =
        (totalTime - seamlessLoop.duration() * iterationRef.current) /
        seamlessLoop.duration();

      if (progress > 1) {
        iterationRef.current++;
        scrubRef.current.pause();
      } else if (progress < 0) {
        iterationRef.current--;
        if (iterationRef.current < 0) {
          iterationRef.current = 9;
          seamlessLoop.totalTime(
            seamlessLoop.totalTime() + seamlessLoop.duration() * 10
          );
          scrubRef.current.pause();
        }
      } else {
        scrubRef.current.vars.totalTime = snap(
          (iterationRef.current + progress) * seamlessLoop.duration()
        );
        scrubRef.current.invalidate().restart();
      }
    };

    const nextBtn = containerRef.current?.querySelector('.carousel-next');
    const prevBtn = containerRef.current?.querySelector('.carousel-prev');

    const handleNextClick = () => {
      scrubTo(scrubRef.current.vars.totalTime + spacing);
    };

    const handlePrevClick = () => {
      scrubTo(scrubRef.current.vars.totalTime - spacing);
    };

    nextBtn?.addEventListener('click', handleNextClick);
    prevBtn?.addEventListener('click', handlePrevClick);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextClick();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Mouse wheel support
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        handleNextClick();
      } else {
        handlePrevClick();
      }
    };

    containerRef.current?.addEventListener('wheel', handleWheel, {
      passive: false,
    });

    return () => {
      nextBtn?.removeEventListener('click', handleNextClick);
      prevBtn?.removeEventListener('click', handlePrevClick);
      window.removeEventListener('keydown', handleKeyDown);
      containerRef.current?.removeEventListener('wheel', handleWheel);
      ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
    };
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className="gallery relative w-full h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Cards Container */}
      <div className="relative w-full h-96 flex items-center justify-center">
        <div
          ref={cardsContainerRef}
          className="cards relative w-56 h-72 flex items-center justify-center"
          style={{
            perspective: '1000px',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="carousel-card absolute w-56 h-72 rounded-2xl border-4 border-white shadow-2xl cursor-pointer"
              style={{
                backgroundImage: item.image ? `url(${item.image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                top: 0,
                left: 0,
              }}
              onClick={item.onClick}
            >
              {/* Overlay for content */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl flex flex-col items-center justify-center p-6">
                {item.icon && <div className="text-6xl mb-4">{item.icon}</div>}
                <h3 className="text-2xl font-bold text-white text-center">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-sm text-gray-300 mt-3 text-center">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="actions flex gap-6 mt-12">
        <button className="carousel-prev px-8 py-3 bg-gradient-to-b from-gray-600 to-gray-700 text-gray-300 rounded-lg font-bold uppercase text-sm hover:from-green-600 hover:to-green-700 hover:text-white transition-all shadow-lg">
          ◀ PREV
        </button>
        <button className="carousel-next px-8 py-3 bg-gradient-to-b from-gray-600 to-gray-700 text-gray-300 rounded-lg font-bold uppercase text-sm hover:from-green-600 hover:to-green-700 hover:text-white transition-all shadow-lg">
          NEXT ▶
        </button>
      </div>

      {/* Instructions */}
      <div className="instruction fixed top-20 right-6 p-4 bg-gray-800/80 backdrop-blur rounded-lg text-sm text-gray-300 border border-gray-700 max-w-xs">
        <p className="font-bold text-white mb-2">Scroll cards by:</p>
        <ul className="text-xs space-y-1">
          <li>• Action Buttons</li>
          <li>• Mouse Wheel</li>
          <li>• Up/Down Arrows</li>
          <li>• Page-Up/Down</li>
        </ul>
      </div>
    </div>
  );
}
