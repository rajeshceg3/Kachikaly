import React, { useState } from 'react';
import Arrival from './Arrival';
import PoolView from './PoolView';

function App() {
  const [, setArrivalComplete] = useState(false);

  return (
    <>
      {/* Arrival overlay handles the initial fade-in */}
      <Arrival onComplete={() => setArrivalComplete(true)} />

      {/* The main interactive view */}
      <PoolView />
    </>
  );
}

export default App;
