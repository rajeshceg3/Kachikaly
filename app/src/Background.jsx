import React from 'react';

const Background = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      background: 'linear-gradient(to bottom, var(--color-near-black) 0%, var(--color-mud-brown) 100%)',
      overflow: 'hidden',
    }}>
      {/* Simulate distant vegetation/earth */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: 0,
        width: '100%',
        height: '60%',
        background: 'linear-gradient(to top, var(--color-moss-green) 0%, transparent 100%)',
        opacity: 0.3,
        filter: 'blur(40px)',
      }}></div>

      {/* Simulate water reflection */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40%',
        background: 'linear-gradient(to top, rgba(92, 107, 75, 0.2), transparent)',
        filter: 'blur(20px)',
      }}></div>

      {/* Simulate light motes */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(170, 182, 194, 0.1) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        filter: 'blur(30px)',
      }}></div>
    </div>
  );
};

export default Background;
