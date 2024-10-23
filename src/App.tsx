import React from 'react';
import PopulationChart from './components/PopulationChart';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">D3.js Population Visualization</h1>
        <PopulationChart />
      </div>
    </div>
  );
}

export default App;