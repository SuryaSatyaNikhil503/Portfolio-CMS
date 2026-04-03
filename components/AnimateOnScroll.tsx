"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

type AnimationDirection =
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "scale-in"
    | "zoom-in";

interface AnimateOnScrollProps {
    children: ReactNode;
    direction?: AnimationDirection;
    delay?: number;
    threshold?: number;
    once?: boolean;
    className?: string;
}

const directionStyles: Record<
    AnimationDirection,
    { initial: React.CSSProperties; animate: React.CSSProperties }
> = {
    "fade-up": {
        initial: { opacity: 0, transform: "translateY(40px)" },
        animate: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-down": {
        initial: { opacity: 0, transform: "translateY(-40px)" },
        animate: { opacity: 1, transform: "translateY(0)" },
    },
    "fade-left": {
        initial: { opacity: 0, transform: "translateX(-40px)" },
        animate: { opacity: 1, transform: "translateX(0)" },
    },
    "fade-right": {
        initial: { opacity: 0, transform: "translateX(40px)" },
        animate: { opacity: 1, transform: "translateX(0)" },
    },
    "scale-in": {
        initial: { opacity: 0, transform: "scale(0.9)" },
        animate: { opacity: 1, transform: "scale(1)" },
    },
    "zoom-in": {
        initial: { opacity: 0, transform: "scale(0.8)" },
        animate: { opacity: 1, transform: "scale(1)" },
    },
};

export default function AnimateOnScroll({
    children,
    direction = "fade-up",
    delay = 0,
    threshold = 0.1,
    once = true,
    className = "",
}: AnimateOnScrollProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(element);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin: "0px 0px -50px 0px" }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, once]);

    const styles = directionStyles[direction];

    return (
        <div
            ref={ref}
            className={className}
            style={{
                ...(isVisible ? styles.animate : styles.initial),
                transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                willChange: "opacity, transform",
            }}
        >
            {children}
        </div>
    );
}
