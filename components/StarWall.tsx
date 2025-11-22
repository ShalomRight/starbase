"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getWallImages } from "../lib/actions"
import { Star, ChevronLeft, ChevronRight, Loader2, Users, TrendingUp } from "lucide-react"

export default function StarWall() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      try {
        const wallImages = await getWallImages()

        // Mock data fallback if empty, similar to PhotoWall
        const mockImages = [
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/588363042_25802814315978061_7224626267314817289_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iQXVAravhGkQ7kNvwEaB8ws&_nc_oc=AdkeF6yAp0gsxVevTZVpriU4eyywGZ0sSJNGY1V4BoWacC528uXxDXa48ePRYiIuds8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=ymxLzUPgGN-DSej9xYSu_w&oh=00_AfgO01jiGDeoyNYL7JsFcDlaskKboYjQi3pDjXaImENmww&oe=6927DA1D", // Campaign vibe
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/546162704_1332115925200750_4753958421008208380_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BFqHpt7tVeYQ7kNvwGGuJ0r&_nc_oc=AdlJRt73gduzLHkUrZFSnsG4UdX5Ap5LVdG5N8Ivp3qyiXXrjZ4ylxHShXaEYuOWVuw&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=2uMm4j5mlzHaY01P8NNang&oh=00_AfjOyoG9jwgv31VZIQk_41jaKYwtkG-Jlx4hmNIuec6EqQ&oe=6927AF39",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/587055389_25778525731740253_7091730232399758850_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FnoOVmaeFxMQ7kNvwGJC7c7&_nc_oc=Adn6iyyq2rLQT7lb6MkZQ9umpowJambmvpjHMQGsSPGA6Z_oouj6qQOV9TBYmcTla4g&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=eXL1h9c2DU99smeu3RVEIA&oh=00_AfjhAE85j5p__v-VhFfWzQRDc584raBXWVDn3pDlhMyupA&oe=6927A92B",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/578152552_1380528110359531_8871945834446734851_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Szbz5J_2C-QQ7kNvwFmSWU1&_nc_oc=AdlZiVw4xbLyQ3E4VifGe0WqRphqdqsTclQxW9m-5OzXnlzmQg7WlbPt8-zBZibvXs8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=rjoplnzs3arqstUIQHw78g&oh=00_Afi8uig-xZfwIYyK1L4Rx0IsFzvwwua2O-0t6daKNnnKYQ&oe=6927C582",
        ]

        const allImages = Array.from(new Set([...wallImages, ...mockImages]))
        setImages(allImages)
      } catch (error) {
        console.error("Failed to load wall", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [])

  // Auto-play
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [currentIndex, images.length])

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-red-700 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
        <h2 className="text-2xl font-black italic uppercase tracking-widest">Loading Star Wall...</h2>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-red-700 overflow-hidden relative flex flex-col">
      {/* Background Gradients and Decorative Stars */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-600 via-red-700 to-red-900 z-0"></div>

      <div className="absolute top-10 right-[-20px] text-red-800 opacity-30 z-0">
        <Star className="w-40 h-40 fill-current" />
      </div>
      <div className="absolute bottom-20 left-[-20px] text-red-800 opacity-30 z-0">
        <Star className="w-32 h-32 fill-current" />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent">
        <div>
          <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter transform -skew-x-6 drop-shadow-lg">
            <span className="text-white">ULP</span> Star Wall
          </h1>
          <p className="text-red-100 font-bold uppercase tracking-widest mt-2 ml-2">
            {images.length} Supporters & Counting
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-black/20 backdrop-blur p-4 rounded-lg transform -skew-x-6 border-2 border-white/20">
            <div className="transform skew-x-6 text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-white" />
              <span className="block text-2xl font-black text-white">{images.length + 120}</span>
              <span className="text-[10px] uppercase font-bold text-red-100">Total Stars</span>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur p-4 rounded-lg transform -skew-x-6 border-2 border-white/20">
            <div className="transform skew-x-6 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
              <span className="block text-2xl font-black text-white">Live</span>
              <span className="text-[10px] uppercase font-bold text-white/60">Updates</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Carousel */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden z-10">
        {/* Background Blur */}
        <div className="absolute inset-0 z-0">
          <motion.img
            key={`bg-${currentIndex}`}
            src={images[currentIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
            className="w-full h-full object-cover blur-3xl scale-110 mix-blend-overlay"
          />
        </div>

        {/* Carousel Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-12 h-[80vh] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full h-full flex items-center justify-center p-8"
            >
              <div className="relative h-full aspect-[9/16] md:aspect-video bg-white p-2 shadow-2xl transform -rotate-1 border-4 border-white">
                <img
                  src={images[currentIndex] || "/placeholder.svg"}
                  alt={`Star ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Badge */}
                <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-4 rounded-full shadow-xl border-4 border-white transform rotate-12 z-20">
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-4 rounded-full backdrop-blur transition-all hover:scale-110 border-2 border-white/10"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-4 rounded-full backdrop-blur transition-all hover:scale-110 border-2 border-white/10"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}
