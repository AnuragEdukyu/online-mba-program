// ============================================================
// FILE: src/Component/Pages/CollegePage/CollegePageDesktop/Component/RankAndAccr.jsx
// SOURCE: https://github.com/rahultech34/edukyu_new/blob/main/src/Component/Pages/CollegePage/CollegePageDesktop/Component/RankAndAccr.jsx
//
// USAGE in MBA Page:
//   import RankAndAccr from "@/Component/Pages/CollegePage/CollegePageDesktop/Component/RankAndAccr";
//
//   const accredData = {
//     university_info: {
//       accreditations: [
//         { name: "AICTE", image: "/aicte.png" },
//         { name: "NAAC",  image: "/naac.png"  },
//         { name: "NBA",   image: "/NBA.png"   },
//         { name: "NIRF",  image: "/nirf.png"  },
//         { name: "WES",   image: "/wes.png"   },
//       ]
//     }
//   };
//   <RankAndAccr college={accredData} />
//
// PROPS:
//   college.university_info.accreditations → [{ name: string, image: string }]
// ============================================================


// Our Accreditations & Recognitions
// Endorsements of Excellence, Recognitions and Accreditations Celebrating Academic Quality ...

import { useRef, useEffect, useState, useMemo } from "react";

const RankAndAccr = ({ college }) => {
    const accrs = college?.university_info?.accreditations || [];

    // Triple+ list for smooth infinite rotation
    const logos = useMemo(
        () => [...accrs, ...accrs, ...accrs, ...accrs, ...accrs, ...accrs, ...accrs],
        [accrs]
    );

    const trackRef     = useRef(null);
    const containerRef = useRef(null);
    const rafRef       = useRef(null);
    const lastTimeRef  = useRef(null);
    const isPausedRef  = useRef(false);
    const [isPaused, setIsPaused] = useState(false);

    const speed = 80; // px/sec
    const GAP   = 16; // gap-4 = 16px

    useEffect(() => {
        const track     = trackRef.current;
        const container = containerRef.current;
        if (!track || !container || accrs.length === 0) return;

        let offset         = 0;
        let singleSetWidth = 0;

        function computeWidth() {
            const items = Array.from(track.children);
            if (items.length === 0) return;
            const firstSet = items.slice(0, accrs.length);
            singleSetWidth = firstSet.reduce((sum, el) => {
                const rect = el.getBoundingClientRect();
                return sum + rect.width + GAP;
            }, 0);
        }

        computeWidth();

        const step = (time) => {
            if (isPausedRef.current) {
                lastTimeRef.current = time;
                rafRef.current = requestAnimationFrame(step);
                return;
            }

            if (!lastTimeRef.current) lastTimeRef.current = time;
            const dt = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            offset -= speed * dt;

            // Seamless infinite loop reset
            if (Math.abs(offset) >= singleSetWidth) {
                offset += singleSetWidth;
            }

            track.style.transform = `translateX(${offset}px)`;
            rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);
        window.addEventListener("resize", computeWidth);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", computeWidth);
            lastTimeRef.current = null;
        };
    }, [logos, accrs.length]);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    return (
        <div className="w-full pt-[32px] flex flex-col max-w-full overflow-hidden">
            {/* Title */}
            <h2 className="text-[48px] font-semibold font-[Outfit] text-[#024B53] mb-[69px] break-words w-[calc(66.67%_-_12px)] leading-normal">
                Rankings &amp; Accreditations
            </h2>

            {/* Sliding Logo Marquee */}
            <div className="w-full overflow-hidden mb-[37px]">
                {logos.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                        No accreditations available
                    </div>
                ) : (
                    <div
                        className="relative overflow-hidden"
                        ref={containerRef}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div
                            ref={trackRef}
                            className="flex items-center gap-4"
                            style={{
                                whiteSpace: "nowrap",
                                transform: "translateX(0px)",
                                willChange: "transform",
                            }}
                        >
                            {logos.map((logo, index) => (
                                <div
                                    key={index}
                                    className="inline-flex w-[90px] h-[90px] items-center justify-center bg-white rounded-[12px] flex-shrink-0"
                                >
                                    <img
                                        src={logo.image}
                                        alt={logo.name || `logo-${index}`}
                                        width={80}
                                        height={80}
                                        className="object-contain w-[80px] h-[80px]"
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RankAndAccr;