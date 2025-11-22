"use client"

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWallImages } from '../lib/actions';
import { Star } from 'lucide-react';

type ImageItem = { src: string; alt?: string };

type DomeGalleryProps = {
    fit?: number;
    fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
    minRadius?: number;
    maxRadius?: number;
    padFactor?: number;
    overlayBlurColor?: string;
    segments?: number;
    imageBorderRadius?: string;
    grayscale?: boolean;
};

type ItemDef = {
    src: string;
    alt: string;
    x: number;
    y: number;
    sizeX: number;
    sizeY: number;
};

const DEFAULTS = {
    segments: 35
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
    const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
    const evenYs = [-4, -2, 0, 2, 4];
    const oddYs = [-3, -1, 1, 3, 5];

    const coords = xCols.flatMap((x, c) => {
        const ys = c % 2 === 0 ? evenYs : oddYs;
        return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
    });

    const totalSlots = coords.length;
    if (pool.length === 0) {
        return coords.map(c => ({ ...c, src: '', alt: '' }));
    }

    const normalizedImages = pool;
    const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

    // Shuffle slightly to avoid obvious patterns if few images
    for (let i = 1; i < usedImages.length; i++) {
        if (usedImages[i].src === usedImages[i - 1].src) {
            for (let j = i + 1; j < usedImages.length; j++) {
                if (usedImages[j].src !== usedImages[i].src) {
                    const tmp = usedImages[i];
                    usedImages[i] = usedImages[j];
                    usedImages[j] = tmp;
                    break;
                }
            }
        }
    }

    return coords.map((c, i) => ({
        ...c,
        src: usedImages[i].src,
        alt: usedImages[i].alt || ''
    }));
}

export default function DomeGallery({
    fit = 0.5,
    fitBasis = 'auto',
    minRadius = 600,
    maxRadius = Infinity,
    padFactor = 0.25,
    overlayBlurColor = '#060010',
    segments = DEFAULTS.segments,
    imageBorderRadius = '12px',
    grayscale = false
}: DomeGalleryProps) {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [popupImage, setPopupImage] = useState<ImageItem | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    const sphereRef = useRef<HTMLDivElement>(null);
    const rotationRef = useRef({ x: 0, y: 0 });
    const requestRef = useRef<number | null>(null);

    // Fetch images
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const urls = await getWallImages();
                if (urls.length > 0) {
                    setImages(urls.map(url => ({ src: url, alt: 'Star Wall Image' })));
                } else {
                    // Fallback
                    setImages([
                        { src: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/588363042_25802814315978061_7224626267314817289_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iQXVAravhGkQ7kNvwEaB8ws&_nc_oc=AdkeF6yAp0gsxVevTZVpriU4eyywGZ0sSJNGY1V4BoWacC528uXxDXa48ePRYiIuds8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=ymxLzUPgGN-DSej9xYSu_w&oh=00_AfgO01jiGDeoyNYL7JsFcDlaskKboYjQi3pDjXaImENmww&oe=6927DA1D" },
                        { src: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/546162704_1332115925200750_4753958421008208380_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BFqHpt7tVeYQ7kNvwGGuJ0r&_nc_oc=AdlJRt73gduzLHkUrZFSnsG4UdX5Ap5LVdG5N8Ivp3qyiXXrjZ4ylxHShXaEYuOWVuw&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=2uMm4j5mlzHaY01P8NNang&oh=00_AfjOyoG9jwgv31VZIQk_41jaKYwtkG-Jlx4hmNIuec6EqQ&oe=6927AF39" },
                        { src: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0" },
                        { src: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/587055389_25778525731740253_7091730232399758850_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FnoOVmaeFxMQ7kNvwGJC7c7&_nc_oc=Adn6iyyq2rLQT7lb6MkZQ9umpowJambmvpjHMQGsSPGA6Z_oouj6qQOV9TBYmcTla4g&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=eXL1h9c2DU99smeu3RVEIA&oh=00_AfjhAE85j5p__v-VhFfWzQRDc584raBXWVDn3pDlhMyupA&oe=6927A92B" },
                        { src: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/578152552_1380528110359531_8871945834446734851_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Szbz5J_2C-QQ7kNvwFmSWU1&_nc_oc=AdlZiVw4xbLyQ3E4VifGe0WqRphqdqsTclQxW9m-5OzXnlzmQg7WlbPt8-zBZibvXs8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=rjoplnzs3arqstUIQHw78g&oh=00_Afi8uig-xZfwIYyK1L4Rx0IsFzvwwua2O-0t6daKNnnKYQ&oe=6927C582" },
                    ]);
                }
            } catch (e) {
                console.error("Failed to fetch images for dome", e);
            }
        };
        fetchImages();
    }, []);

    // Auto-rotation loop
    const animate = useCallback(() => {
        rotationRef.current.y = (rotationRef.current.y + 0.05) % 360; // Adjust speed here
        // rotationRef.current.x = Math.sin(Date.now() / 2000) * 2; // Slight wave effect

        if (sphereRef.current) {
            sphereRef.current.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
        }
        requestRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [animate]);

    // Pop-out interval
    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(() => {
            const randomImg = images[Math.floor(Math.random() * images.length)];
            setPopupImage(randomImg);

            // Hide after 3 seconds
            setTimeout(() => {
                setPopupImage(null);
            }, 3000);
        }, 5000);

        return () => clearInterval(interval);
    }, [images]);

    const items = useMemo(() => buildItems(images, segments), [images, segments]);

    // Resize observer for radius
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const ro = new ResizeObserver(entries => {
            const cr = entries[0].contentRect;
            const w = Math.max(1, cr.width), h = Math.max(1, cr.height);
            const minDim = Math.min(w, h);
            let radius = minDim * fit;
            radius = clamp(radius, minRadius, maxRadius);

            root.style.setProperty('--radius', `${radius}px`);
            root.style.setProperty('--viewer-pad', `${Math.max(8, Math.round(minDim * padFactor))}px`);
        });
        ro.observe(root);
        return () => ro.disconnect();
    }, [fit, minRadius, maxRadius, padFactor]);

    const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px; bottom: -999px; left: -999px; right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
    }
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      backface-visibility: hidden;
      transform: translateZ(0);
    }
  `;

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
            <div
                ref={rootRef}
                className="sphere-root relative w-full h-full bg-neutral-950 overflow-hidden flex flex-col"
                style={{
                    ['--segments-x' as any]: segments,
                    ['--segments-y' as any]: segments,
                    ['--tile-radius' as any]: imageBorderRadius,
                } as React.CSSProperties}
            >
                {/* Header */}
                <header className="bg-gradient-to-r from-red-700 to-red-800 shadow-xl z-20 flex-none relative">
                    <div className="flex items-center justify-between p-4">
                        <div className="text-left">
                            <h1 className="text-2xl font-sans font-black italic uppercase tracking-tighter transform -skew-x-6 text-white">
                                Star Dome
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                                {images.length} Rotating Stars
                            </p>
                        </div>
                        <div className="bg-black/20 p-2 rounded-full">
                            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                        </div>
                    </div>
                    {/* Stats Bar */}
                    <div className="bg-red-900/50 border-t border-red-600/30 px-4 py-2">
                        <div className="flex justify-between items-center text-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] uppercase tracking-wider text-red-100 font-bold">Live Gallery</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-red-200 font-bold">
                                ULP 2025
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Dome Area */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-neutral-950 to-neutral-950 pointer-events-none z-0" />

                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none z-0"></div>

                    <div className="stage z-10">
                        <div ref={sphereRef} className="sphere">
                            {items.map((it, i) => (
                                <div
                                    key={`${it.x},${it.y},${i}`}
                                    className="sphere-item absolute m-auto"
                                    style={{
                                        ['--offset-x' as any]: it.x,
                                        ['--offset-y' as any]: it.y,
                                        ['--item-size-x' as any]: it.sizeX,
                                        ['--item-size-y' as any]: it.sizeY,
                                    } as React.CSSProperties}
                                >
                                    <div className="item__image bg-neutral-800 border border-white/10">
                                        <img
                                            src={it.src}
                                            alt={it.alt}
                                            className="w-full h-full object-cover"
                                            style={{ filter: grayscale ? 'grayscale(1)' : 'none' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pop-out Overlay */}
                <AnimatePresence>
                    {popupImage && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 50, rotateX: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: -50 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                className="relative max-w-sm w-full"
                            >
                                <div className="bg-white p-2 shadow-2xl border-4 border-red-600 transform -rotate-2">
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <img
                                            src={popupImage.src}
                                            alt="Featured Star"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-black italic uppercase text-xs">
                                            Featured
                                        </div>
                                    </div>
                                    <div className="bg-neutral-900 text-white p-3 mt-2 flex items-center justify-between">
                                        <span className="font-black italic uppercase text-sm tracking-wider">ULP Star</span>
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
