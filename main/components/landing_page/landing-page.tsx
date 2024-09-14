"use client";

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { UtensilsIcon, SunIcon, MoonIcon, MoreVerticalIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  const chatPosts = [
    {
      prompt: "Show me the best place for authentic ramen in Little Tokyo",
      response: "Daikokuya in Little Tokyo is renowned for its authentic ramen. Their rich tonkotsu broth and perfectly chewy noodles create a memorable dining experience. The intimate setting and often long wait times speak to its popularity and quality.",
      image: "./green-pasta-FT-RECIPE0521-510d065cf45940fdb4e86b76000cfd80.jpg"
    },
    {
      prompt: "What's a great vegan-friendly restaurant in Silver Lake?",
      response: "Flore Vegan in Silver Lake is a standout choice for plant-based dining. They offer a diverse menu of comfort foods and brunch items, all 100% vegan. Their Buffalo Cauliflower Wings and the Reuben sandwich are local favorites.",
      image: "./green-pasta-FT-RECIPE0521-510d065cf45940fdb4e86b76000cfd80.jpg"
    },
    {
      prompt: "Where can I find the best fish tacos in Santa Monica?",
      response: "For the best fish tacos in Santa Monica, head to Tacos Punta Cabras. Their Baja-style fish tacos feature crispy, battered fish topped with cabbage slaw and a zesty crema. The beachside location adds to the authentic coastal experience.",
      image: "/placeholder.svg?height=400&width=600"
    },
    {
      prompt: "Recommend a romantic Italian restaurant in Beverly Hills",
      response: "Il Cielo in Beverly Hills offers a truly romantic Italian dining experience. The restaurant features a beautiful garden setting with twinkling lights, creating an intimate atmosphere. Their handmade pasta dishes and extensive wine list make for an unforgettable date night.",
      image: "/placeholder.svg?height=400&width=600"
    },
    {
      prompt: "What's the best place for Korean BBQ in Koreatown?",
      response: "Park's BBQ in Koreatown is widely regarded as one of the best Korean BBQ restaurants in Los Angeles. Known for its high-quality meat selections and attentive service, it offers an authentic Korean grilling experience. Don't miss their marinated short ribs (galbi) and beef brisket.",
      image: "/placeholder.svg?height=400&width=600"
    }
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % chatPosts.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + chatPosts.length) % chatPosts.length)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');
        :root {
          --font-lexend: 'Lexend', sans-serif;
        }
        body {
          font-family: var(--font-lexend);
        }
      `}</style>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-lexend flex-grow flex flex-col">
        <motion.header
          className="flex justify-between items-center p-4 sticky top-0 bg-white dark:bg-gray-900 z-10"
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
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Sign in</Button>
            </motion.div>
          </nav>
        </motion.header>

        <main className="container mx-auto px-4 py-8 flex-grow flex flex-col md:flex-row items-center">
          <motion.div className="w-full md:w-1/2 pr-0 md:pr-8 mb-8 md:mb-0" variants={itemVariants}>
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-yellow-400 dark:from-purple-400 dark:to-yellow-300"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              MunchLA
            </motion.h1>
            <motion.h2
              className="text-2xl md:text-3xl font-semibold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Supercharge your culinary adventures
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Chat to start discovering, planning, and exploring LA's vibrant food scene with AI
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3">
                Sign in
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="w-full md:w-1/2"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <img 
                    src={chatPosts[currentIndex].image} 
                    alt="Food" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-x-4 bottom-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md max-w-[90%]">
                    <p className="text-base md:text-lg font-semibold mb-2 text-purple-600 dark:text-purple-400">
                      {chatPosts[currentIndex].prompt}
                    </p>
                    <p className="text-sm md:text-base">{chatPosts[currentIndex].response}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
              <button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={prevSlide}
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>
              <button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={nextSlide}
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>
            </div>
          </motion.div>
        </main>

        <motion.footer
          className="py-4 text-center text-sm text-gray-600 dark:text-gray-400 mt-auto"
          variants={itemVariants}
        >
          <UtensilsIcon className="inline-block mr-2 h-4 w-4" />
          MunchLA &middot; Privacy & Terms
        </motion.footer>
      </div>
    </motion.div>
  )
}