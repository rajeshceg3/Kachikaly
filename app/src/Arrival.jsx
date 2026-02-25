import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Arrival = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Wait 6 seconds before starting the fade out
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      data-testid="arrival-root"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 4, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (!isVisible && onComplete) onComplete();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        pointerEvents: isVisible ? 'auto' : 'none',
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
    </motion.div>
  );
};

export default Arrival;
