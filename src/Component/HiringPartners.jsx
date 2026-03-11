// ============================================================
// FILE: src/Component/Common/HiringPartners.jsx
// USAGE: <HiringPartners partners={HIRING_DATA} />
// partners → [{ name: string, image: string }]
// ============================================================

import { useRef, useEffect, useState, useMemo } from "react";

const HiringPartners = ({
    partners = [],
    speed    = 80,
    title    = "Hiring Partners",
}) => {

    const logos = useMemo(
        () => [...partners, ...partners, ...partners, ...partners, ...partners, ...partners, ...partners],
        [partners]
    );

    const trackRef     = useRef(null);
    const containerRef = useRef(null);
    const rafRef       = useRef(null);
    const lastTimeRef  = useRef(null);
    const isPausedRef  = useRef(false);
    const [isPaused, setIsPaused] = useState(false);

    const GAP = 16;

    useEffect(() => {
        const track     = trackRef.current;
        const container = containerRef.current;
        if (!track || !container || partners.length === 0) return;

        let offset         = 0;
        let singleSetWidth = 0;

        function computeWidth() {
            const items = Array.from(track.children);
            if (items.length === 0) return;
            const firstSet = items.slice(0, partners.length);
            singleSetWidth = firstSet.reduce((sum, el) => {
                return sum + el.getBoundingClientRect().width + GAP;
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
            if (Math.abs(offset) >= singleSetWidth) offset += singleSetWidth;
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
    }, [logos, partners.length, speed]);

    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

    return (
        <div className="w-full pt-[32px] flex flex-col max-w-full overflow-hidden">

            {/* Title — same as RankAndAccr */}
            <h2 className="text-[48px] font-semibold font-[Outfit] text-[#024B53] mb-[69px] break-words w-[calc(66.67%_-_12px)] leading-normal">
                {title}
            </h2>

            <div className="w-full overflow-hidden mb-[37px]">
                {logos.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">No hiring partners available</div>
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
                                        alt={logo.name || `partner-${index}`}
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

export default HiringPartners;