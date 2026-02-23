import React, { useRef, useEffect, useState, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useTransform, useSpring, useAnimationFrame, AnimatePresence } from 'framer-motion';
import Background from './Background';

const PoolView = () => {
  const depth = useMotionValue(0); // 0 to 100 representing proximity
  const isMoving = useRef(false);
  const [activeText, setActiveText] = useState(null);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef(null);

  // Mouse parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out movement
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 30 });

  // Transform depth to scale (zoom effect)
  const scale = useTransform(depth, [0, 100], [1, 1.5]);

  // Timer logic
  const startTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), 120000);
  }, []);

  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('wheel', resetIdleTimer);

    startTimer(); // Just start timer on mount

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('wheel', resetIdleTimer);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [resetIdleTimer, startTimer]);

  // Listen to depth changes for text triggers
  useEffect(() => {
    const unsubscribe = depth.on("change", (latest) => {
      if (latest > 30 && latest < 60) {
        setActiveText("This pool is older than memory.");
      } else if (latest > 70) {
        setActiveText("They have remained when others disappeared.");
      } else {
        setActiveText(null);
      }
    });
    return () => unsubscribe();
  }, [depth]);

  // Animation loop for smooth depth changes
  useAnimationFrame((time, delta) => {
    if (isMoving.current) {
      const current = depth.get();
      if (current < 100) {
        depth.set(Math.min(100, current + (delta * 0.03)));
      }
    }
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      // Parallax calculation
      const x = (clientX - window.innerWidth / 2) * 0.05;
      const y = (clientY - window.innerHeight / 2) * 0.05;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      onMouseDown={() => { isMoving.current = true; resetIdleTimer(); }}
      onMouseUp={() => isMoving.current = false}
      onMouseLeave={() => isMoving.current = false}
      onTouchStart={() => { isMoving.current = true; resetIdleTimer(); }}
      onTouchEnd={() => isMoving.current = false}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: isIdle ? 'none' : 'grab', // Hide cursor when idle
        position: 'relative',
        backgroundColor: 'var(--color-near-black)'
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          x: smoothX,
          y: smoothY,
          scale: scale,
          originX: 0.5,
          originY: 0.5,
        }}
      >
        <Background />
      </motion.div>

      {/* Vignette Overlay - Persists as part of environment */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        background: 'radial-gradient(circle, transparent 60%, var(--color-near-black) 100%)',
        opacity: 0.4
      }}></div>

      {/* Text Overlay - Fades out when idle */}
      <AnimatePresence>
        {activeText && !isIdle && (
          <motion.div
            key={activeText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              position: 'absolute',
              bottom: '20%',
              left: 0,
              width: '100%',
              textAlign: 'center',
              color: 'var(--color-text-main)',
              fontSize: '1.2rem',
              pointerEvents: 'none',
              fontFamily: 'var(--font-main)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              padding: '0 20px'
            }}
          >
            {activeText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PoolView;
