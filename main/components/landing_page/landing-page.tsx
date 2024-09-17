"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  UtensilsIcon,
  SunIcon,
  MoonIcon,
  MoreVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset to light mode when component mounts
    setIsDarkMode(false);
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const chatPosts = [
    {
      prompt: "Where is a high-end sushi places in Los Angeles",
      response:
        "Nobu Los Angeles offers a luxurious sushi experience with a globally renowned reputation for its high-quality ingredients and innovative dishes. The elegant ambiance and creative menu, featuring items like miso-marinated cod and yellowtail jalapeño, make it a top choice for sushi enthusiasts seeking both sophistication and exceptional flavors.",
      image: "/images/nobu.jpg",
    },
    {
      prompt: "What's a top spot for chicken lovers in the Los Angeles area?",
      response:
        "Canes' is a popular fast-food chain throughout the Los Angeles area, known for its iconic offerings like the Caniac Combo. With numerous locations across the city, it provides a convenient and consistent dining option for both locals and visitors.",
      image: "/images/canes.png",
    },
    {
      prompt: "What's a great French bistro with a great view in Los Angeles?",
      response:
        "Porch in Los Angeles is a charming French bistro known for its delightful, traditional cuisine and cozy ambiance. With a menu that features classic dishes like croissants and quiches, it offers an authentic taste of France right in the heart of the city.",
      image: "/images/porch-la.jpeg",
    },
    {
      prompt: "Recommend a romantic Italian restaurant in Los Angeles",
      response:
        "Bestia in Los Angeles is an excellent choice for a romantic Italian dining experience. Known for its industrial-chic setting, it offers a cozy yet vibrant atmosphere. The menu boasts a variety of house-made charcuterie, pastas, and wood-fired pizzas, paired with a diverse selection of wines and cocktails, making it perfect for a memorable date night.",
      image: "/images/bestia.jpg",
    },
    {
      prompt: "What's the best place for Korean BBQ in Koreatown?",
      response:
        "Quarter's BBQ in Koreatown is widely regarded as one of the best Korean BBQ restaurants in Los Angeles. Known for its high-quality meat selections and attentive service, it offers an authentic Korean grilling experience. Don't miss their marinated short ribs (galbi) and beef brisket.",
      image: "/images/kbbq.jpg",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % chatPosts.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + chatPosts.length) % chatPosts.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap");
        :root {
          --font-lexend: "Lexend", sans-serif;
        }
        body {
          font-family: var(--font-lexend);
          margin: 0;
          padding: 0;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-lexend flex flex-col h-full">
        <motion.header
          className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 z-10"
          variants={itemVariants}
        >
          <motion.div
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            MunchLA
          </motion.div>
          <nav className="flex items-center space-x-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-400"
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Sign in
                </Button>
              </Link>
            </motion.div>
          </nav>
        </motion.header>

        <main className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 overflow-hidden">
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8">
            <motion.div
              className="w-full md:w-1/2 max-w-md"
              variants={itemVariants}
            >
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                MunchLA
              </motion.h1>
              <motion.h2
                className="text-xl md:text-2xl font-semibold mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Supercharge your culinary adventures
              </motion.h2>
              <motion.p
                className="text-base md:text-lg mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Chat to start discovering, planning, and exploring LA's vibrant
                food scene with AI
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Link href="/login">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-6 py-2">
                    Sign in
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="w-full md:w-1/2 max-w-md h-[40vh] md:h-[50vh]"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Image
                      src={chatPosts[currentIndex].image}
                      alt="Food"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="rounded-2xl object-cover"
                    />
                    <div className="absolute inset-x-4 bottom-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md max-w-[80%] max-h-[30%] overflow-y-auto">
                      <p className="text-xs md:text-sm font-semibold mb-1 text-purple-600 dark:text-purple-400">
                        {chatPosts[currentIndex].prompt}
                      </p>
                      <p className="text-xs line-clamp-2 md:line-clamp-3">
                        {chatPosts[currentIndex].response}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
                <button
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  onClick={prevSlide}
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  onClick={nextSlide}
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          </div>
        </main>

        <motion.footer
          className="py-2 text-center text-xs text-gray-600 dark:text-gray-400"
          variants={itemVariants}
        >
          <UtensilsIcon className="inline-block mr-1 h-3 w-3" />
          MunchLA &middot; Privacy & Terms
        </motion.footer>
      </div>
    </motion.div>
  );
}
