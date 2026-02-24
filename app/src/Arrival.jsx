import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import audioEngine from './audio/AudioEngine';

const Arrival = ({ onComplete }) => {
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        audioEngine.play();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [hasInteracted]);

  return (
    <motion.div
      data-testid="arrival-root"
      initial={{ opacity: 1 }}
      animate={{ opacity: hasInteracted ? 0 : 1 }}
      transition={{ duration: 4, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (hasInteracted && onComplete) onComplete();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        pointerEvents: hasInteracted ? 'none' : 'auto',
        background: 'linear-gradient(to bottom, #000000 0%, #1a1510 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e0d8c8',
        fontFamily: 'serif',
        textAlign: 'center'
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: hasInteracted ? 0 : 1, y: hasInteracted ? -20 : 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          fontSize: '2rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 300,
          marginBottom: '2rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}
      >
        Enter the Sacred Pool
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: hasInteracted ? 0 : 0.6 }}
        transition={{ duration: 1.5, delay: 1 }}
        style={{
          color: '#a0968c',
          fontFamily: 'sans-serif',
          fontSize: '0.9rem',
          letterSpacing: '0.1em'
        }}
      >
        Click anywhere to begin
      </motion.p>
    </motion.div>
  );
};

export default Arrival;
