import React, { useState } from 'react';
import AISimulation from './AISimulation';
import ThresholdSimulation from './Threshold_sim';
import AdvancedReactorAnalysis from './Dashboard';
import { ArrowLeftRight, Brain, Shield, BarChart3 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'ai', 'threshold', 'dashboard'
  
  // If viewing a specific page, render that component
  if (currentView === 'ai') {
    return <AISimulation onBack={() => setCurrentView('home')} />;
  }
  
  if (currentView === 'threshold') {
    return <ThresholdSimulation onBack={() => setCurrentView('home')} />;
  }
  
  if (currentView === 'dashboard') {
    return <AdvancedReactorAnalysis onBack={() => setCurrentView('home')} />;
  }
  
  // Home screen with three cards
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white p-6">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Nuclear Reactor Safety Suite</h1>
        <p className="text-xl text-gray-300">Choose a simulation or view the analysis dashboard</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* AI Simulation Card */}
        <div 
          onClick={() => setCurrentView('ai')}
          className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl border-2 border-purple-600 p-8 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
        >
          <Brain className="w-20 h-20 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-center mb-2">AI System</h2>
          <p className="text-center text-purple-300">Physics-based detection</p>
        </div>

        {/* Threshold Simulation Card */}
        <div 
          onClick={() => setCurrentView('threshold')}
          className="bg-gradient-to-br from-orange-900 to-red-900 rounded-xl border-2 border-orange-600 p-8 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
        >
          <Shield className="w-20 h-20 text-orange-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-center mb-2">Threshold System</h2>
          <p className="text-center text-orange-300">Traditional monitoring</p>
        </div>

        {/* Dashboard Card */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl border-2 border-green-600 p-8 shadow-2xl cursor-pointer hover:scale-105 transition-transform"
        >
          <BarChart3 className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-center mb-2">Analysis Dashboard</h2>
          <p className="text-center text-green-300">Compare results</p>
        </div>
      </div>
    </div>
  );
}