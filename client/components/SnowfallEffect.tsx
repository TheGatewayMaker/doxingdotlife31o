import { useEffect, useRef } from "react";

interface Snowflake {
  id: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  swingAmount: number;
  opacity: number;
}

const SnowfallEffect = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const generateSnowflakes = () => {
      const flakes: Snowflake[] = [];
      const count =
        window.innerWidth < 768 ? 30 : window.innerWidth < 1024 ? 40 : 60;

      for (let i = 0; i < count; i++) {
        flakes.push({
          id: `snowflake-${i}`,
          x: Math.random() * 100,
          size: Math.random() * (6 - 2.5) + 2.5,
          duration: Math.random() * (20 - 12) + 12,
          delay: Math.random() * 3,
          swingAmount: Math.random() * 100 - 50,
          opacity: Math.random() * (1 - 0.4) + 0.4,
        });
      }
      return flakes;
    };

    const createSnowflakes = (flakes: Snowflake[]) => {
      // Clear existing content
      container.innerHTML = "";

      // Create or update the style element
      if (!styleRef.current) {
        styleRef.current = document.createElement("style");
        document.head.appendChild(styleRef.current);
      }

      let cssRules = "";

      flakes.forEach((flake) => {
        const snowflake = document.createElement("div");
        snowflake.id = flake.id;
        snowflake.className =
          "fixed pointer-events-none select-none font-semibold";
        snowflake.innerHTML = "❄";

        snowflake.style.cssText = `
          left: ${flake.x}%;
          top: -10px;
          font-size: ${flake.size}px;
          opacity: ${flake.opacity};
          z-index: 10;
          text-shadow: 0 0 8px rgba(0, 136, 204, 0.3);
        `;

        container.appendChild(snowflake);

        // Build CSS rules for animations
        cssRules += `
          #${flake.id} {
            animation: snowfall ${flake.duration}s linear ${flake.delay}s infinite,
                      snowswing ${flake.duration * 0.8}s ease-in-out ${flake.delay}s infinite;
          }
        `;
      });

      // Update all styles at once
      if (styleRef.current) {
        styleRef.current.innerHTML = cssRules;
      }
    };

    const flakes = generateSnowflakes();
    createSnowflakes(flakes);

    // Handle window resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newFlakes = generateSnowflakes();
        createSnowflakes(newFlakes);
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      if (styleRef.current && styleRef.current.parentElement) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-screen pointer-events-none overflow-hidden z-20"
      style={{
        mixBlendMode: "overlay",
        willChange: "transform",
      }}
    />
  );
};

export default SnowfallEffect;
