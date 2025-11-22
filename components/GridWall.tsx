// "use client"

// import React, { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { getWallImages } from '../lib/actions';
// import { Star } from 'lucide-react';

// // --- Types ---

// interface Item {
//     id: string;
//     img: string;
//     url: string;
//     height: number;
// }

// // --- Marquee Component ---

// const Marquee: React.FC<{ items: Item[], speed?: number }> = ({ items, speed = 30 }) => {
//     // Duplicate items to create a seamless loop
//     // We need enough items to fill the screen width plus some buffer
//     // For simplicity, let's quadruple the list if it's small, or just double it
//     const marqueeItems = [...items, ...items, ...items, ...items];

//     return (
//         <div className="flex items-center h-full overflow-hidden relative w-full">
//             <motion.div
//                 className="flex items-center gap-0" // gap-0 because we handle spacing/overlap manually
//                 animate={{
//                     x: [0, -1000], // Adjust based on content width. 
//                     // Better approach: animate percentage if we can, or use a very large number and reset
//                     // For a true infinite loop with variable widths, it's trickier.
//                     // Let's use a simpler approach: standard marquee with percentage if possible, 
//                     // or just a long strip that resets.
//                     // Given the "left to right" request, let's move positive.
//                     // But usually "scrolling" means content moves.
//                     // Let's try moving LEFT (standard) first, as it feels more natural for reading.
//                     // If they specifically said "left to right", I can invert it.
//                     // "move from left to right" -> x goes 0 -> positive.
//                 }}
//                 // Let's try a simpler CSS-based marquee or Framer Motion loop
//                 animate={{ x: ["-50%", "0%"] }} // Moves left to right
//                 transition={{
//                     x: {
//                         repeat: Infinity,
//                         repeatType: "loop",
//                         duration: speed * 2,
//                         ease: "linear",
//                     },
//                 }}
//                 style={{
//                     width: "fit-content",
//                     display: "flex",
//                     flexDirection: "row",
//                 }}
//             >
//                 {marqueeItems.map((item, index) => (
//                     <div
//                         key={`${item.id}-${index}`}
//                         className="relative flex-shrink-0"
//                         style={{
//                             width: "200px", // Fixed width for consistency
//                             height: item.height,
//                             marginLeft: "-30px", // Negative margin for overlap
//                             zIndex: index, // Ensure proper stacking order
//                         }}
//                     >
//                         <motion.div
//                             className="w-full h-full cursor-pointer"
//                             whileHover={{
//                                 scale: 1.1,
//                                 zIndex: 100,
//                                 rotate: Math.random() * 4 - 2
//                             }}
//                             onClick={() => window.open(item.url, '_blank', 'noopener')}
//                         >
//                             <div
//                                 className="w-full h-full bg-cover bg-center rounded-xl shadow-2xl border-2 border-white/10 overflow-hidden relative"
//                                 style={{
//                                     backgroundImage: `url(${item.img})`,
//                                     transform: `rotate(${index % 2 === 0 ? 2 : -2}deg)` // Slight rotation for organic feel
//                                 }}
//                             >
//                                 <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-transparent to-transparent opacity-40 hover:opacity-20 transition-opacity" />
//                             </div>
//                         </motion.div>
//                     </div>
//                 ))}
//             </motion.div>
//         </div>
//     );
// };

// // --- Main GridWall Component ---

// export default function GridWall() {
//     const [items, setItems] = useState<Item[]>([]);
//     const [popupImage, setPopupImage] = useState<Item | null>(null);

//     useEffect(() => {
//         const fetchImages = async () => {
//             try {
//                 const urls = await getWallImages();
//                 let imageList: string[] = [];

//                 if (urls.length > 0) {
//                     imageList = urls;
//                 } else {
//                     // Fallback images
//                     imageList = [
//                         "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/588363042_25802814315978061_7224626267314817289_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iQXVAravhGkQ7kNvwEaB8ws&_nc_oc=AdkeFyAp0gsxVevTZVpriU4eyywGZ0sSJNGY1V4BoWacC528uXxDXa48ePRYiIuds8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=ymxLzUPgGN-DSej9xYSu_w&oh=00_AfgO01jiGDeoyNYL7JsFcDlaskKboYjQi3pDjXaImENmww&oe=6927DA1D",
//                         "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/546162704_1332115925200750_4753958421008208380_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BFqHpt7tVeYQ7kNvwGGuJ0r&_nc_oc=AdlJRt73gduzLHkUrZFSnsG4UdX5Ap5LVdG5N8Ivp3qyiXXrjZ4ylxHShXaEYuOWVuw&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=2uMm4j5mlzHaY01P8NNang&oh=00_AfjOyoG9jwgv31VZIQk_41jaKYwtkG-Jlx4hmNIuec6EqQ&oe=6927AF39",
//                         "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
//                         "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
//                         "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
//                         "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/587055389_25778525731740253_7091730232399758850_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FnoOVmaeFxMQ7kNvwGJC7c7&_nc_oc=Adn6iyyq2rLQT7lb6MkZQ9umpowJambmvpjHMQGsSPGA6Z_oouj6qQOV9TBYmcTla4g&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=eXL1h9c2DU99smeu3RVEIA&oh=00_AfjhAE85j5p__v-VhFfWzQRDc584raBXWVDn3pDlhMyupA&oe=6927A92B",
//                         "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/578152552_1380528110359531_8871945834446734851_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Szbz5J_2C-QQ7kNvwFmSWU1&_nc_oc=AdlZiVw4xbLyQ3E4VifGe0WqRphqdqsTclQxW9m-5OzXnlzmQg7WlbPt8-zBZibvXs8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=rjoplnzs3arqstUIQHw78g&oh=00_Afi8uig-xZfwIYyK1L4Rx0IsFzvwwua2O-0t6daKNnnKYQ&oe=6927C582",
//                     ];
//                 }

//                 // Process images
//                 const gridItems: Item[] = imageList.map((url, i) => ({
//                     id: `item-${i}`,
//                     img: url,
//                     url: url,
//                     height: Math.random() > 0.5 ? 300 : 400 // Random height
//                 }));

//                 setItems(gridItems);

//             } catch (e) {
//                 console.error("Failed to fetch images for grid", e);
//             }
//         };
//         fetchImages();
//     }, []);

//     // Pop-out interval
//     useEffect(() => {
//         if (items.length === 0) return;

//         const interval = setInterval(() => {
//             const randomItem = items[Math.floor(Math.random() * items.length)];
//             setPopupImage(randomItem);

//             // Hide after 3 seconds
//             setTimeout(() => {
//                 setPopupImage(null);
//             }, 3000);
//         }, 5000);

//         return () => clearInterval(interval);
//     }, [items]);

//     return (
//         <div className="h-full w-full bg-neutral-950 flex flex-col text-white overflow-hidden relative">
//             {/* Header */}
//             <header className="bg-gradient-to-r from-red-700 to-red-800 shadow-xl z-20 flex-none relative">
//                 <div className="flex items-center justify-between p-4">
//                     <div className="text-left">
//                         <h1 className="text-2xl font-sans font-black italic uppercase tracking-tighter transform -skew-x-6 text-white">
//                             Star Grid
//                         </h1>
//                         <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
//                             {items.length} Stars
//                         </p>
//                     </div>
//                     <div className="bg-black/20 p-2 rounded-full">
//                         <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
//                     </div>
//                 </div>
//                 {/* Stats Bar */}
//                 <div className="bg-red-900/50 border-t border-red-600/30 px-4 py-2">
//                     <div className="flex justify-between items-center text-center gap-4">
//                         <div className="flex items-center gap-2">
//                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                             <span className="text-[10px] uppercase tracking-wider text-red-100 font-bold">Live Grid</span>
//                         </div>
//                         <div className="text-[10px] uppercase tracking-wider text-red-200 font-bold">
//                             ULP 2025
//                         </div>
//                     </div>
//                 </div>
//             </header>

//             {/* Main Grid Area */}
//             <div className="flex-1 relative overflow-hidden flex items-center">
//                 {/* Background Gradient */}
//                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-neutral-950 to-neutral-950 pointer-events-none z-0" />

//                 {/* Marquee Rows - We can have multiple rows if we want, or just one big one centered */}
//                 <div className="w-full">
//                     <Marquee items={items} speed={40} />
//                 </div>
//             </div>

//             {/* Pop-out Overlay */}
//             <AnimatePresence>
//                 {popupImage && (
//                     <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-8">
//                         <motion.div
//                             initial={{ opacity: 0, scale: 0.5, y: 50, rotateX: 20 }}
//                             animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
//                             exit={{ opacity: 0, scale: 0.8, y: -50 }}
//                             transition={{ type: "spring", damping: 20, stiffness: 300 }}
//                             className="relative max-w-sm w-full"
//                         >
//                             <div className="bg-white p-2 shadow-2xl border-4 border-red-600 transform -rotate-2">
//                                 <div className="relative aspect-[4/5] overflow-hidden">
//                                     <img
//                                         src={popupImage.img}
//                                         alt="Featured Star"
//                                         className="w-full h-full object-cover"
//                                     />
//                                     <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-black italic uppercase text-xs">
//                                         Featured
//                                     </div>
//                                 </div>
//                                 <div className="bg-neutral-900 text-white p-3 mt-2 flex items-center justify-between">
//                                     <span className="font-black italic uppercase text-sm tracking-wider">ULP Star</span>
//                                     <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
//                                 </div>
//                             </div>
//                         </motion.div>
//                     </div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// }

"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

// --- Types ---

interface Item {
    id: string;
    img: string;
    url: string;
    height: number;
}

// Mock function to simulate getWallImages
const getWallImages = async () => {
    return [
        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/588363042_25802814315978061_7224626267314817289_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iQXVAravhGkQ7kNvwEaB8ws&_nc_oc=AdkeFyAp0gsxVevTZVpriU4eyywGZ0sSJNGY1V4BoWacC528uXxDXa48ePRYiIuds8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=ymxLzUPgGN-DSej9xYSu_w&oh=00_AfgO01jiGDeoyNYL7JsFcDlaskKboYjQi3pDjXaImENmww&oe=6927DA1D",
        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/546162704_1332115925200750_4753958421008208380_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BFqHpt7tVeYQ7kNvwGGuJ0r&_nc_oc=AdlJRt73gduzLHkUrZFSnsG4UdX5Ap5LVdG5N8Ivp3qyiXXrjZ4ylxHShXaEYuOWVuw&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=2uMm4j5mlzHaY01P8NNang&oh=00_AfjOyoG9jwgv31VZIQk_41jaKYwtkG-Jlx4hmNIuec6EqQ&oe=6927AF39",
        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/587055389_25778525731740253_7091730232399758850_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FnoOVmaeFxMQ7kNvwGJC7c7&_nc_oc=Adn6iyyq2rLQT7lb6MkZQ9umpowJambmvpjHMQGsSPGA6Z_oouj6qQOV9TBYmcTla4g&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=eXL1h9c2DU99smeu3RVEIA&oh=00_AfjhAE85j5p__v-VhFfWzQRDc584raBXWVDn3pDlhMyupA&oe=6927A92B",
        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/578152552_1380528110359531_8871945834446734851_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Szbz5J_2C-QQ7kNvwFmSWU1&_nc_oc=AdlZiVw4xbLyQ3E4VifGe0WqRphqdqsTclQxW9m-5OzXnlzmQg7WlbPt8-zBZibvXs8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=rjoplnzs3arqstUIQHw78g&oh=00_Afi8uig-xZfwIYyK1L4Rx0IsFzvwwua2O-0t6daKNnnKYQ&oe=6927C582",
    ];
};

// --- Marquee Component ---

const Marquee: React.FC<{ items: Item[], speed?: number }> = ({ items, speed = 30 }) => {
    const marqueeItems = [...items, ...items, ...items, ...items];

    return (
        <div className="flex items-center h-full overflow-hidden relative w-full">
            <motion.div
                className="flex items-center gap-0"
                animate={{ x: ["-50%", "0%"] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: speed * 2,
                        ease: "linear",
                    },
                }}
                style={{
                    width: "fit-content",
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                {marqueeItems.map((item, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        className="relative flex-shrink-0"
                        style={{
                            width: "200px",
                            height: item.height,
                            marginLeft: "-30px",
                            zIndex: index,
                        }}
                    >
                        <motion.div
                            className="w-full h-full cursor-pointer"
                            whileHover={{
                                scale: 1.1,
                                zIndex: 100,
                                rotate: Math.random() * 4 - 2
                            }}
                            onClick={() => window.open(item.url, '_blank', 'noopener')}
                        >
                            <div
                                className="w-full h-full bg-cover bg-center rounded-xl shadow-2xl border-4 border-white overflow-hidden relative"
                                style={{
                                    backgroundImage: `url(${item.img})`,
                                    transform: `rotate(${index % 2 === 0 ? 2 : -2}deg)`
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-transparent to-transparent opacity-40 hover:opacity-20 transition-opacity" />
                            </div>
                        </motion.div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// --- Main GridWall Component ---

export default function GridWall() {
    const [items, setItems] = useState<Item[]>([]);
    const [popupImage, setPopupImage] = useState<Item | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const urls = await getWallImages();
                let imageList: string[] = [];

                if (urls.length > 0) {
                    imageList = urls;
                } else {
                    imageList = [
                        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/588363042_25802814315978061_7224626267314817289_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iQXVAravhGkQ7kNvwEaB8ws&_nc_oc=AdkeFyAp0gsxVevTZVpriU4eyywGZ0sSJNGY1V4BoWacC528uXxDXa48ePRYiIuds8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=ymxLzUPgGN-DSej9xYSu_w&oh=00_AfgO01jiGDeoyNYL7JsFcDlaskKboYjQi3pDjXaImENmww&oe=6927DA1D",
                        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/546162704_1332115925200750_4753958421008208380_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BFqHpt7tVeYQ7kNvwGGuJ0r&_nc_oc=AdlJRt73gduzLHkUrZFSnsG4UdX5Ap5LVdG5N8Ivp3qyiXXrjZ4ylxHShXaEYuOWVuw&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=2uMm4j5mlzHaY01P8NNang&oh=00_AfjOyoG9jwgv31VZIQk_41jaKYwtkG-Jlx4hmNIuec6EqQ&oe=6927AF39",
                        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
                        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
                        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
                        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/587055389_25778525731740253_7091730232399758850_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FnoOVmaeFxMQ7kNvwGJC7c7&_nc_oc=Adn6iyyq2rLQT7lb6MkZQ9umpowJambmvpjHMQGsSPGA6Z_oouj6qQOV9TBYmcTla4g&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=eXL1h9c2DU99smeu3RVEIA&oh=00_AfjhAE85j5p__v-VhFfWzQRDc584raBXWVDn3pDlhMyupA&oe=6927A92B",
                        "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/578152552_1380528110359531_8871945834446734851_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Szbz5J_2C-QQ7kNvwFmSWU1&_nc_oc=AdlZiVw4xbLyQ3E4VifGe0WqRphqdqsTclQxW9m-5OzXnlzmQg7WlbPt8-zBZibvXs8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=rjoplnzs3arqstUIQHw78g&oh=00_Afi8uig-xZfwIYyK1L4Rx0IsFzvwwua2O-0t6daKNnnKYQ&oe=6927C582",
                    ];
                }

                const gridItems: Item[] = imageList.map((url, i) => ({
                    id: `item-${i}`,
                    img: url,
                    url: url,
                    height: Math.random() > 0.5 ? 300 : 400
                }));

                setItems(gridItems);

            } catch (e) {
                console.error("Failed to fetch images for grid", e);
            }
        };
        fetchImages();
    }, []);

    useEffect(() => {
        if (items.length === 0) return;

        const interval = setInterval(() => {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            setPopupImage(randomItem);

            setTimeout(() => {
                setPopupImage(null);
            }, 3000);
        }, 5000);

        return () => clearInterval(interval);
    }, [items]);

    return (
        <div className="h-full w-full bg-red-700 flex flex-col text-white overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-600 via-red-700 to-red-900 z-0"></div>

            {/* Decorative Stars */}
            <div className="absolute top-10 right-[-20px] text-red-800 opacity-30 z-0">
                <Star className="w-40 h-40 fill-current" />
            </div>
            <div className="absolute bottom-20 left-[-20px] text-red-800 opacity-30 z-0">
                <Star className="w-32 h-32 fill-current" />
            </div>

            {/* Header */}
            <header className="z-20 flex-none relative bg-gradient-to-b from-black/40 to-transparent">
                <div className="flex items-center justify-between p-4">
                    <div className="text-left">
                        <h1 className="text-2xl font-sans font-black italic uppercase tracking-tighter transform -skew-x-6 text-white drop-shadow-lg">
                            Star Grid
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-100 ml-2">
                            {items.length} Stars
                        </p>
                    </div>
                    <div className="bg-black/20 backdrop-blur p-2 rounded-full border-2 border-white/20">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                    </div>
                </div>
                {/* Stats Bar */}
                <div className="bg-black/20 backdrop-blur border-t border-white/10 px-4 py-2">
                    <div className="flex justify-between items-center text-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] uppercase tracking-wider text-red-100 font-bold">Live Grid</span>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-red-100 font-bold">
                            ULP 2025
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Grid Area */}
            <div className="flex-1 relative overflow-hidden flex items-center z-10">
                {/* Marquee Rows */}
                <div className="w-full">
                    <Marquee items={items} speed={40} />
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
                            <div className="bg-white p-2 shadow-2xl border-4 border-white transform -rotate-2">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    <img
                                        src={popupImage.img}
                                        alt="Featured Star"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-black italic uppercase text-xs">
                                        Featured
                                    </div>
                                </div>
                                <div className="bg-red-700 text-white p-3 mt-2 flex items-center justify-between">
                                    <span className="font-black italic uppercase text-sm tracking-wider">ULP Star</span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}