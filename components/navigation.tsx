"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Moon,
  Sun,
  Menu,
  X,
  Home,
  BookOpen,
  Play,
  Brain,
  Target,
  Star,
  Calculator,
  Lightbulb,
  Gamepad2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState as useNewsState, useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Library", icon: BookOpen },
  { href: "/lectures", label: "Lectures", icon: Play },
  { href: "/smart-calculator", label: "Smart Calculator", icon: Calculator, badge: "New~AI" },
  { href: "/ai-tutor", label: "AI Tutor", icon: Brain, badge: "Coming Soon" },
  { href: "/quiz", label: "Quiz", icon: Target },
  { href: "/dashboard", label: "Dashboard", icon: Star },
  { href: "/projects", label: "Projects", icon: Lightbulb },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { soundEnabled, toggleSound, playHoverSound, playClickSound } =
    useSoundEffects();

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 h-16 items-center">
            {/* Logo - Left Column */}
            <div className="flex justify-start">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
                  <img
                    src="/vtu-logo.png"
                    alt="IgniteVita Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                  <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400 hidden" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-black dark:text-white">
                    IgniteVidya
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">
                    Equal learning for all
                  </span>
                </div>
              </Link>
            </div>

            {/* News Section - Center Column */}
            <div className="flex justify-center">
              <NewsSection />
            </div>

            {/* Actions - Right Column */}
            <div className="flex justify-end">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    playClickSound("secondary");
                    toggleSound();
                  }}
                  onMouseEnter={() => playHoverSound("button")}
                  className="rounded-xl"
                  title={soundEnabled ? "Disable sounds" : "Enable sounds"}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  )}
                  <span className="sr-only">Toggle sound</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    playClickSound("secondary");
                    setTheme(theme === "dark" ? "light" : "dark");
                  }}
                  onMouseEnter={() => playHoverSound("button")}
                  className="rounded-xl"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    playClickSound("navigation");
                    setIsOpen(!isOpen);
                  }}
                  onMouseEnter={() => playHoverSound("button")}
                  className="rounded-xl"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Actions */}
              <div className="md:hidden flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    playClickSound("secondary");
                    toggleSound();
                  }}
                  onMouseEnter={() => playHoverSound("button")}
                  className="rounded-xl"
                  title={soundEnabled ? "Disable sounds" : "Enable sounds"}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  )}
                  <span className="sr-only">Toggle sound</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    playClickSound("secondary");
                    setTheme(theme === "dark" ? "light" : "dark");
                  }}
                  onMouseEnter={() => playHoverSound("button")}
                  className="rounded-xl"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    playClickSound("navigation");
                    setIsOpen(!isOpen);
                  }}
                  onMouseEnter={() => playHoverSound("button")}
                  className="rounded-xl"
                >
                  {isOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sliding Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-white/10 backdrop-blur-sm z-50"
            />

            {/* Navigation Panel */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
            >
              <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                    Navigation
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                    {navItems.map((item) => (
                      item.badge === "Coming Soon" ? (
                        <div
                          key={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            alert("AI Tutor is coming soon! Stay tuned for updates.");
                            playClickSound("navigation");
                          }}
                          onMouseEnter={() => playHoverSound("link")}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative cursor-not-allowed opacity-75 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-600 dark:text-blue-400">
                            {item.badge}
                          </span>
                        </div>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            playClickSound("navigation");
                            setIsOpen(false);
                          }}
                          onMouseEnter={() => playHoverSound("link")}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative",
                            pathname === item.href
                              ? "bg-black dark:bg-white text-white dark:text-black"
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-500 text-black shadow-lg relative overflow-hidden">
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></span>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// News Section Component
function NewsSection() {
  const [currentNews, setCurrentNews] = useNewsState(0);

  const newsItems = [
    "📢 STEM Education Summit 2024 - Register for free workshops",
    "📢 Mathematics Olympiad results announced - Check winners list",
    "📢 New Chemistry lab equipment installed in 50+ schools",
    "📢 Biology project competition deadline: March 20, 2024",
    "📢 Physics practical exam schedule released for Class 12",
    "📢 Computer Science coding bootcamp - Applications open",
    "📢 Science Fair 2024 - Theme: Sustainable Technology",
    "📢 Engineering entrance exam pattern updated for 2024",
    "📢 CBSE Board exam dates announced for Science subjects",
    "📢 Robotics workshop for grades 9-12 - Limited seats available",
    "📢 New NCERT textbooks for Physics and Chemistry released",
    "📢 Top 100 Engineering colleges ranking published",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % newsItems.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:block">
      <div className="text-center max-w-lg mx-auto relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 -inset-y-4 -inset-x-8 bg-pink-500/8 dark:bg-pink-400/10 rounded-xl blur-xl animate-pulse" />
        <div className="absolute inset-0 -inset-y-2 -inset-x-4 bg-pink-500/15 dark:bg-pink-400/20 rounded-lg blur-lg animate-pulse" />

        <div className="relative z-10">
          <div className="flex items-center justify-center mb-1">
            <span
              className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide"
              style={{
                textShadow:
                  "0 0 8px rgba(236, 72, 153, 0.5), 0 0 16px rgba(236, 72, 153, 0.3), 0 0 24px rgba(236, 72, 153, 0.2)",
              }}
            >
              Latest News
            </span>
            <div
              className="ml-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse"
              style={{
                boxShadow:
                  "0 0 6px rgba(236, 72, 153, 0.6), 0 0 12px rgba(236, 72, 153, 0.4)",
              }}
            />
          </div>
          <div className="overflow-hidden">
            <p
              className="text-sm text-pink-600 dark:text-pink-400 font-semibold transition-all duration-300 whitespace-nowrap text-ellipsis overflow-hidden"
              style={{
                textShadow:
                  "0 0 6px rgba(236, 72, 153, 0.5), 0 0 12px rgba(236, 72, 153, 0.3), 0 0 18px rgba(236, 72, 153, 0.2)",
              }}
            >
              {newsItems[currentNews]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
