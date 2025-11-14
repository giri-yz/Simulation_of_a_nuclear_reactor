import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Droplets, Gauge, Shield, Brain, Zap, Eye } from 'lucide-react';

export default function NuclearReactorSimulation() {
  const [state, setState] = useState({
    actualTemp: 280,
    displayedTemp: 280,
    power: 2000,
    rodPosition: 50,
    flow: 18000,
    pressure: 155,
    boronLevel: 0,
    status: 'safe'
  });

  const [currentAttack, setCurrentAttack] = useState(null);
  const [mitigationActive, setMitigationActive] = useState(false);
  const [mitigationSystems, setMitigationSystems] = useState({
    emergencyCooling: false,
    pressureRelief: false,
    boronInjection: false,
    controlRods: 'normal'
  });
  const [eventLog, setEventLog] = useState(['✅ System initialized', '✅ All systems nominal']);
  const [time, setTime] = useState(0);
  const [aiDetectionScore, setAiDetectionScore] = useState(0);
  const [aiDetectionTime, setAiDetectionTime] = useState(null);
  const [thresholdDetectionTime, setThresholdDetectionTime] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [attackStartTime, setAttackStartTime] = useState(null);
  
  const [physicsTwin, setPhysicsTwin] = useState({
    predictedTemp: 280,
    predictedPower: 2000,
    predictedPressure: 155,
    predictedFlow: 18000,
    neutronFlux: 1.0,
    thermalEnergy: 0,
    reactivity: 0
  });

  const [physicsDeviation, setPhysicsDeviation] = useState({
    tempDev: 0,
    powerDev: 0,
    pressureDev: 0,
    overallScore: 0
  });

  const [signalAnalysis, setSignalAnalysis] = useState({
    autocorrelation: 0,
    varianceScore: 0,
    entropyScore: 0
  });

  const [challengeResponse, setChallengeResponse] = useState({
    active: false,
    expectedResponse: null,
    actualResponse: null,
    testsPassed: 0,
    testsFailed: 0,
    lastTest: 0
  });

  const addLog = (message) => {
    setEventLog(prev => [...prev.slice(-11), message]);
  };

  const getTempColor = (temp) => {
    if (temp < 280) return '#22c55e';
    if (temp < 300) return '#84cc16';
    if (temp < 320) return '#eab308';
    if (temp < 340) return '#f97316';
    if (temp < 360) return '#ef4444';
    return '#dc2626';
  };

  const coreColor = getTempColor(state.actualTemp);
  const flowOpacity = Math.min(state.flow / 20000, 1);

  // MODULE 3: COMPARISON ENGINE
  const calculatePhysicsDeviation = (sensorState, physicsState) => {
    const tempDev = Math.abs(sensorState.actualTemp - physicsState.predictedTemp);
    const powerDev = Math.abs(sensorState.power - physicsState.predictedPower);
    const pressureDev = Math.abs(sensorState.pressure - physicsState.predictedPressure);
    
    // Weighted overall score (0-1 scale)
    const tempScore = Math.min(tempDev / 100, 1.0); // Max deviation 100°C = 1.0
    const powerScore = Math.min(powerDev / 2000, 1.0); // Max deviation 2000 MW = 1.0
    const pressureScore = Math.min(pressureDev / 50, 1.0); // Max deviation 50 Bar = 1.0
    
    const overallScore = (tempScore * 0.5) + (powerScore * 0.3) + (pressureScore * 0.2);
    
    return { tempDev, powerDev, pressureDev, overallScore };
  };

  // MODULE 4: SIGNAL ANALYSIS (Replay/Noise Detection)
  const analyzeSignalPatterns = (history) => {
    if (history.length < 20) return { autocorrelation: 0, varianceScore: 0, entropyScore: 0 };
    
    const recent = history.slice(-20);
    const temps = recent.map(d => d.actualTemp);
    
    // Autocorrelation - detect repeating patterns
    let autocorr = 0;
    for (let lag = 1; lag <= 5; lag++) {
      let sum = 0;
      for (let i = lag; i < temps.length; i++) {
        sum += temps[i] * temps[i - lag];
      }
      autocorr += Math.abs(sum / (temps.length - lag));
    }
    autocorr = autocorr / 5 / 100000; // Normalize
    
    // Variance analysis
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const variance = temps.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / temps.length;
    const varianceScore = variance < 0.5 ? 0.8 : Math.max(0, 1 - variance / 10);
    
    // Entropy - low entropy = suspicious
    const bins = 10;
    const counts = new Array(bins).fill(0);
    temps.forEach(t => {
      const bin = Math.floor(((t - 250) / 150) * bins);
      if (bin >= 0 && bin < bins) counts[bin]++;
    });
    let entropy = 0;
    counts.forEach(c => {
      if (c > 0) {
        const p = c / temps.length;
        entropy -= p * Math.log2(p);
      }
    });
    const entropyScore = entropy < 2 ? 0.7 : 0;
    
    return { autocorrelation: autocorr, varianceScore, entropyScore };
  };

  const calculateAnomalyScore = (currentState, history) => {
    if (history.length < 10) return 0;
    
    let anomalyScore = 0;
    const recent = history.slice(-10);
    
    const avgTemp = recent.reduce((sum, d) => sum + d.actualTemp, 0) / recent.length;
    const avgFlow = recent.reduce((sum, d) => sum + d.flow, 0) / recent.length;
    const avgPower = recent.reduce((sum, d) => sum + d.power, 0) / recent.length;
    const avgPressure = recent.reduce((sum, d) => sum + d.pressure, 0) / recent.length;
    
    const tempStdDev = Math.sqrt(recent.reduce((sum, d) => sum + Math.pow(d.actualTemp - avgTemp, 2), 0) / recent.length);
    const flowStdDev = Math.sqrt(recent.reduce((sum, d) => sum + Math.pow(d.flow - avgFlow, 2), 0) / recent.length);
    const powerStdDev = Math.sqrt(recent.reduce((sum, d) => sum + Math.pow(d.power - avgPower, 2), 0) / recent.length);
    
    const tempZScore = Math.abs((currentState.actualTemp - avgTemp) / (tempStdDev + 0.1));
    const flowZScore = Math.abs((currentState.flow - avgFlow) / (flowStdDev + 0.1));
    const powerZScore = Math.abs((currentState.power - avgPower) / (powerStdDev + 0.1));
    
    anomalyScore += Math.min(tempZScore * 0.15, 0.4);
    anomalyScore += Math.min(flowZScore * 0.12, 0.3);
    anomalyScore += Math.min(powerZScore * 0.1, 0.25);
    
    const expectedTempFromPower = 280 + (currentState.power - 2000) / 20;
    const tempPowerDeviation = Math.abs(currentState.actualTemp - expectedTempFromPower) / 50;
    anomalyScore += Math.min(tempPowerDeviation * 0.2, 0.3);
    
    const expectedFlow = 18000 - (currentState.actualTemp - 280) * 30;
    const flowTempDeviation = Math.abs(currentState.flow - expectedFlow) / 5000;
    anomalyScore += Math.min(flowTempDeviation * 0.15, 0.25);
    
    if (history.length >= 2) {
      const lastState = history[history.length - 1];
      const tempChangeRate = Math.abs(currentState.actualTemp - lastState.actualTemp);
      const flowChangeRate = Math.abs(currentState.flow - lastState.flow);
      const powerChangeRate = Math.abs(currentState.power - lastState.power);
      
      anomalyScore += Math.min(tempChangeRate * 0.03, 0.3);
      anomalyScore += Math.min(flowChangeRate * 0.0001, 0.2);
      anomalyScore += Math.min(powerChangeRate * 0.002, 0.25);
    }
    
    if (recent.length >= 5) {
      const lastFive = recent.slice(-5);
      const tempVariance = lastFive.reduce((sum, d, i, arr) => {
        if (i === 0) return 0;
        return sum + Math.abs(d.actualTemp - arr[i-1].actualTemp);
      }, 0) / 4;
      
      if (tempVariance < 0.1) {
        anomalyScore += 0.4;
      }
    }
    
    if (history.length >= 3) {
      const last3 = history.slice(-3);
      const tempIncreasing = last3.every((d, i, arr) => i === 0 || d.actualTemp >= arr[i-1].actualTemp);
      const flowDecreasing = last3.every((d, i, arr) => i === 0 || d.flow <= arr[i-1].flow);
      const powerIncreasing = last3.every((d, i, arr) => i === 0 || d.power >= arr[i-1].power);
      
      if ((tempIncreasing && flowDecreasing) || (tempIncreasing && powerIncreasing)) {
        anomalyScore += 0.3;
      }
    }
    
      // ADD PHYSICS TWIN DEVIATION (Module 2+3)
  const physicsTempDev = Math.abs(currentState.actualTemp - physicsTwin.predictedTemp) / 50;
  anomalyScore += Math.min(physicsTempDev * 0.25, 0.4);
  
  const physicsPowerDev = Math.abs(currentState.power - physicsTwin.predictedPower) / 1000;
  anomalyScore += Math.min(physicsPowerDev * 0.15, 0.3);
  
  // ADD SIGNAL ANALYSIS (Module 4)
  const signals = analyzeSignalPatterns(history);
  anomalyScore += signals.varianceScore * 0.3;
  anomalyScore += signals.entropyScore * 0.2;
  
  return Math.min(anomalyScore, 1.0);
};
  

  const triggerAttack = (type, description) => {
    setCurrentAttack(type);
    addLog(`🚨 ATTACK: ${description}`);
    setMitigationActive(false);
    setMitigationSystems({
      emergencyCooling: false,
      pressureRelief: false,
      boronInjection: false,
      controlRods: 'normal'
    });
    setAiDetectionScore(0);
    setAiDetectionTime(null);
    setThresholdDetectionTime(null);
    setAttackStartTime(time);
  };

  const reset = () => {
    setState({
      actualTemp: 280,
      displayedTemp: 280,
      power: 2000,
      rodPosition: 50,
      flow: 18000,
      pressure: 155,
      boronLevel: 0,
      status: 'safe'
    });
    setCurrentAttack(null);
    setMitigationActive(false);
    setMitigationSystems({
      emergencyCooling: false,
      pressureRelief: false,
      boronInjection: false,
      controlRods: 'normal'
    });
    setEventLog(['✅ System reset', '✅ All systems nominal']);
    setTime(0);
    setAiDetectionScore(0);
    setAiDetectionTime(null);
    setThresholdDetectionTime(null);
    setHistoricalData([]);
    setAttackStartTime(null);
  };

  const calculatePhysicsTwin = (prevPhysics, controlInputs, deltaTime) => {
    const { rodPosition, boronLevel, targetFlow } = controlInputs;
    
    const rodReactivity = (50 - rodPosition) * 0.0002;
    const boronReactivity = -boronLevel * 0.00015;
    const totalReactivity = rodReactivity + boronReactivity;
    
    const newNeutronFlux = prevPhysics.neutronFlux * (1 + totalReactivity * deltaTime);
    const clampedFlux = Math.max(0.5, Math.min(2.0, newNeutronFlux));
    
    const predictedPower = 2000 * clampedFlux;
    const heatGeneration = predictedPower * 10;
    const heatRemovalRate = targetFlow * 0.5;
    const netHeat = heatGeneration - heatRemovalRate;
    const newThermalEnergy = prevPhysics.thermalEnergy + netHeat * deltaTime;
    
    const thermalMass = 5000;
    const predictedTemp = 280 + (newThermalEnergy / thermalMass);
    const clampedTemp = Math.max(250, Math.min(450, predictedTemp));
    
    const predictedPressure = 155 + (clampedTemp - 280) * 0.5 + (predictedPower - 2000) * 0.01;
    const predictedFlow = targetFlow;
    
    return {
      predictedTemp: clampedTemp,
      predictedPower: Math.max(500, Math.min(5000, predictedPower)),
      predictedPressure: Math.max(140, Math.min(200, predictedPressure)),
      predictedFlow: predictedFlow,
      neutronFlux: clampedFlux,
      thermalEnergy: newThermalEnergy,
      reactivity: totalReactivity
    };
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.1);
      
      setPhysicsTwin(prevPhysics => {
        return calculatePhysicsTwin(prevPhysics, {
          rodPosition: state.rodPosition,
          boronLevel: state.boronLevel,
          targetFlow: 18000
        }, 0.1);
      });

      setState(prev => {
        let newState = { ...prev };

        if (currentAttack === 'loca') {
          newState.flow = Math.max(5000, newState.flow - 200);
          if (newState.flow < 12000 && !mitigationActive && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold detected LOCA at ${(time - attackStartTime).toFixed(1)}s`);
          }
          if (newState.flow < 12000 && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: false,
              controlRods: 'scram'
            });
            addLog('🛡️ Emergency cooling activated');
            addLog('🛡️ Control rod SCRAM initiated');
          }
          if (mitigationActive) {
            newState.flow = Math.min(20000, newState.flow + 300);
            newState.rodPosition = Math.max(0, newState.rodPosition - 2);
          }
        }

        if (currentAttack === 'overflow') {
          newState.flow = Math.min(28000, newState.flow + 150);
          if (newState.flow > 22000 && !mitigationActive && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold detected overflow at ${(time - attackStartTime).toFixed(1)}s`);
          }
          if (newState.flow > 22000 && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: false,
              pressureRelief: true,
              boronInjection: false,
              controlRods: 'partial'
            });
            addLog('🛡️ Pressure relief valves opened');
            addLog('🛡️ Partial control rod insertion');
          }
          if (mitigationActive) {
            newState.flow = Math.max(18000, newState.flow - 250);
            newState.rodPosition = Math.max(20, newState.rodPosition - 1);
          }
        }

        if (currentAttack === 'power_spike') {
          newState.power = Math.min(5000, newState.power + 50);
          newState.rodPosition = Math.min(100, newState.rodPosition + 1);
          if (newState.power > 3500 && !mitigationActive && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold detected power spike at ${(time - attackStartTime).toFixed(1)}s`);
          }
          if (newState.power > 3500 && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: false,
              controlRods: 'fast_scram'
            });
            addLog('🛡️ Power excursion detected');
            addLog('🛡️ Fast SCRAM - rods fully inserted');
          }
          if (mitigationActive) {
            newState.rodPosition = Math.max(0, newState.rodPosition - 4);
            newState.flow = Math.min(24000, newState.flow + 200);
          }
        }

        if (currentAttack === 'slow_drift') {
          newState.actualTemp += 0.08;
          newState.displayedTemp = 285 + Math.sin(time * 0.3) * 5;
          newState.power += 1.5;
          
          if (newState.actualTemp > 350 && !mitigationActive && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold FINALLY detected at ${(time - attackStartTime).toFixed(1)}s`);
          }
          if (newState.actualTemp > 350 && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: false,
              controlRods: 'scram'
            });
            addLog('🛡️ Emergency systems activated (LATE!)');
          }
          if (mitigationActive) {
            newState.rodPosition = Math.max(0, newState.rodPosition - 2);
            newState.flow = Math.min(24000, newState.flow + 200);
          }
        }

        if (currentAttack === 'coordinated') {
          newState.actualTemp += 0.12;
          newState.flow = Math.max(10000, newState.flow - 25);
          newState.power += 2.5;
          newState.pressure += 0.08;
          
          if ((newState.actualTemp > 340 || newState.flow < 13000) && !mitigationActive && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold detected coordinated attack at ${(time - attackStartTime).toFixed(1)}s`);
          }
          if ((newState.actualTemp > 340 || newState.flow < 13000) && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: false,
              controlRods: 'scram'
            });
            addLog('🛡️ Coordinated attack mitigation');
          }
          if (mitigationActive) {
            newState.rodPosition = Math.max(0, newState.rodPosition - 2);
            newState.flow = Math.min(22000, newState.flow + 300);
          }
        }

        if (currentAttack === 'replay') {
          newState.displayedTemp = 285 + Math.sin(time * 0.2) * 3;
          newState.actualTemp += 0.15;
          newState.power += 3;
          
          if (newState.actualTemp > 370 && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: false,
              controlRods: 'fast_scram'
            });
            addLog('🛡️ CRITICAL: Physical damage imminent!');
          }
          if (mitigationActive) {
            newState.rodPosition = Math.max(0, newState.rodPosition - 3);
            newState.flow = Math.min(26000, newState.flow + 400);
          }
        }

        if (currentAttack === 'rod_stuck_slow') {
          newState.rodPosition = Math.min(75, newState.rodPosition + 0.3);
          newState.power += 2;
          
          if (newState.power > 3200 && !mitigationActive && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold detected rod issue at ${(time - attackStartTime).toFixed(1)}s`);
          }
          if (newState.power > 3200 && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: true,
              controlRods: 'stuck'
            });
            addLog('⚠️ Control rods stuck - slow drift');
            addLog('🛡️ Boron injection initiated');
          }
          if (mitigationActive) {
            newState.boronLevel = Math.min(100, newState.boronLevel + 0.5);
            newState.flow = Math.min(23000, newState.flow + 150);
          }
        }

        if (currentAttack === 'pressure_slow') {
          newState.pressure += 0.15;
          newState.actualTemp += 0.05;
          
          if (newState.pressure > 180 && !mitigationActive && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold detected pressure at ${(time - attackStartTime).toFixed(1)}s`);
          }
          if (newState.pressure > 180 && !mitigationActive) {
            setMitigationActive(true);
            setMitigationSystems({
              emergencyCooling: false,
              pressureRelief: true,
              boronInjection: false,
              controlRods: 'scram'
            });
            addLog('🛡️ Pressure relief system activated');
          }
          if (mitigationActive) {
            newState.pressure = Math.max(155, newState.pressure - 1.2);
            newState.rodPosition = Math.max(0, newState.rodPosition - 2);
          }
        }

        const tempChange = (newState.power / 200) - (newState.flow / 1000) + (100 - newState.rodPosition) / 10;
        if (!['slow_drift', 'coordinated', 'replay', 'rod_stuck_slow', 'pressure_slow'].includes(currentAttack)) {
          newState.actualTemp = Math.max(250, Math.min(400, newState.actualTemp + tempChange * 0.01));
        }

        if (!['slow_drift', 'replay'].includes(currentAttack)) {
          newState.displayedTemp = newState.actualTemp;
        }

        const boronEffect = newState.boronLevel / 10;
        if (!['slow_drift', 'coordinated', 'replay', 'rod_stuck_slow', 'power_spike'].includes(currentAttack)) {
          newState.power = Math.max(500, newState.power + (newState.rodPosition - 50) * 2 - boronEffect * 5);
        }

        if (!['pressure_slow', 'coordinated'].includes(currentAttack)) {
          newState.pressure = 155 + (newState.actualTemp - 280) * 0.5 + (newState.power - 2000) * 0.01;
        }

        if (newState.actualTemp > 350 || newState.pressure > 180 || newState.power > 3500) {
          newState.status = 'critical';
        } else if (newState.actualTemp > 320 || newState.pressure > 165 || newState.flow < 14000) {
          newState.status = 'warning';
        } else {
          newState.status = 'safe';
        }

        return newState;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentAttack, mitigationActive, time, attackStartTime, thresholdDetectionTime]);

  useEffect(() => {
    if (time % 0.1 < 0.05) {
      const newHistoricalEntry = {
        time: time,
        actualTemp: state.actualTemp,
        displayedTemp: state.displayedTemp,
        power: state.power,
        flow: state.flow,
        pressure: state.pressure,
        rodPosition: state.rodPosition
      };
      
      setHistoricalData(prev => [...prev.slice(-50), newHistoricalEntry]);
      
// MODULE 5: CHALLENGE-RESPONSE TESTING
      if (time - challengeResponse.lastTest > 5 && currentAttack && !challengeResponse.active) {
        // Trigger test every 5 seconds during attacks
        const testRodPosition = state.rodPosition + (Math.random() * 10 - 5);
        setChallengeResponse(prev => ({
          ...prev,
          active: true,
          expectedResponse: testRodPosition * 2, // Expected power change
          lastTest: time
        }));
      }
      
      if (challengeResponse.active && time - challengeResponse.lastTest > 1) {
        // Check response after 1 second
        const actualChange = state.power - historicalData[historicalData.length - 10]?.power || 0;
        const expectedChange = challengeResponse.expectedResponse;
        
        if (Math.abs(actualChange - expectedChange) > 100 && currentAttack === 'replay') {
          setChallengeResponse(prev => ({
            ...prev,
            active: false,
            testsFailed: prev.testsFailed + 1
          }));
          addLog('🎯 Challenge-Response: SENSOR NOT RESPONDING!');
        } else {
          setChallengeResponse(prev => ({
            ...prev,
            active: false,
            testsPassed: prev.testsPassed + 1
          }));
        }
      }

      // Calculate physics deviation (Module 3)
      const deviation = calculatePhysicsDeviation(state, physicsTwin);
      setPhysicsDeviation(deviation);
      
      // Calculate signal analysis (Module 4)
      if (historicalData.length >= 20) {
        const signals = analyzeSignalPatterns(historicalData);
        setSignalAnalysis(signals);
      }

      if (currentAttack && historicalData.length >= 10) {
        const anomalyScore = calculateAnomalyScore(state, historicalData);
        setAiDetectionScore(anomalyScore);
        
        if (anomalyScore > 0.65 && !aiDetectionTime && !mitigationActive) {
          setAiDetectionTime(time - attackStartTime);
          addLog(`🤖 AI DETECTED ANOMALY at ${(time - attackStartTime).toFixed(1)}s!`);
          addLog(`🤖 AI Score: ${(anomalyScore * 100).toFixed(0)}% - Initiating mitigation`);
          
          setMitigationActive(true);
          
          if (currentAttack === 'slow_drift' || currentAttack === 'replay') {
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: false,
              controlRods: 'scram'
            });
          } else if (currentAttack === 'coordinated') {
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: true,
              boronInjection: false,
              controlRods: 'scram'
            });
          } else if (currentAttack === 'rod_stuck_slow') {
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: true,
              controlRods: 'stuck'
            });
          } else if (currentAttack === 'pressure_slow') {
            setMitigationSystems({
              emergencyCooling: false,
              pressureRelief: true,
              boronInjection: false,
              controlRods: 'scram'
            });
          }
        }
      }
    }
  }, [time, state, currentAttack, historicalData, aiDetectionTime, attackStartTime, mitigationActive]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-4 md:p-6">
      {mitigationSystems.emergencyCooling && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 font-bold text-lg animate-pulse z-50">
          ❄️ EMERGENCY COOLING SYSTEM ACTIVE
        </div>
      )}

      <div className={mitigationSystems.emergencyCooling ? 'mt-12' : ''}>
        <header className="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-700 mb-4 md:mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800 opacity-90"></div>
          
          <div className="absolute inset-0 opacity-10 pointer-events-none"
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                 animation: 'scan 8s linear infinite'
               }}></div>

          <div className="relative flex flex-wrap items-center justify-between p-4 md:p-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl md:text-2xl shadow-lg">
                ⚛️
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Nuclear Reactor Digital Twin
                </h1>
                <p className="text-xs text-gray-400 font-mono">AI-Powered Cybersecurity Simulation</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <div className={`relative px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold shadow-lg transition-all text-sm md:text-base ${
                state.status === 'safe' ? 'bg-gradient-to-r from-green-600 to-green-700' :
                state.status === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse' :
                'bg-gradient-to-r from-yellow-600 to-yellow-700'
              }`}>
                <div className="absolute inset-0 bg-white opacity-20 rounded-lg blur"></div>
                <div className="relative flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    state.status === 'safe' ? 'bg-green-300' :
                    state.status === 'critical' ? 'bg-red-300 animate-ping' :
                    'bg-yellow-300'
                  }`}></div>
                  {state.status.toUpperCase()}
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-sm px-3 md:px-4 py-2 rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400">Runtime</div>
                <div className="text-base md:text-lg font-bold font-mono">⏱ {time.toFixed(1)}s</div>
              </div>

              {currentAttack && (
                <div className="relative bg-gradient-to-r from-red-800 to-red-900 px-3 md:px-5 py-2 md:py-2.5 rounded-lg font-bold animate-pulse shadow-lg text-sm">
                  <div className="absolute inset-0 bg-red-500 opacity-20 rounded-lg blur"></div>
                  <div className="relative flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">{currentAttack.toUpperCase().replace('_', ' ')}</span>
                    <span className="sm:hidden">ATTACK</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <style>{`
            @keyframes scan {
              0% { transform: translateY(0); }
              100% { transform: translateY(10px); }
            }
          `}</style>
        </header>

        <main className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-6">
          {/* LEFT COLUMN - Reactor Visualization */}
          <div className="xl:col-span-3 bg-gray-900/70 rounded-xl p-4 md:p-5 shadow-inner border border-gray-800">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Reactor Core Visualization</h2>

            <div className="relative bg-gray-900 rounded-lg p-4 min-h-[500px] md:min-h-[600px]">
              {/* Coolant Inlet */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="text-center mb-2 font-bold text-cyan-400 text-xs md:text-sm">COOLANT INLET</div>
                <div className="w-20 md:w-24 h-12 md:h-16 bg-blue-900 border-4 border-blue-700 rounded-t-lg flex items-center justify-center">
                  <Droplets className="w-6 md:w-8 h-6 md:h-8 text-cyan-400" />
                </div>
                <div className="w-6 md:w-8 mx-auto bg-blue-800 border-2 border-blue-600 h-8 md:h-10">
                  {state.flow > 5000 && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={i}
                             className="w-3 h-3 bg-cyan-400 rounded-full mx-auto my-1 animate-ping"
                             style={{ opacity: flowOpacity, animationDelay: `${i * 0.3}s` }} />
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Pressure Vessel */}
              <div className="absolute top-20 md:top-28 left-1/2 transform -translate-x-1/2 w-72 md:w-96 rounded-lg border-4 md:border-8 shadow-2xl" 
                   style={{ 
                     height: '320px',
                     background: 'linear-gradient(135deg, #4b5563 0%, #374151 50%, #1f2937 100%)',
                     borderColor: '#52525b',
                     boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
                   }}>
                
                <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 px-3 md:px-4 py-1 rounded font-bold text-xs md:text-sm"
                     style={{
                       background: 'linear-gradient(145deg, #6b7280, #4b5563)',
                       boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.2)'
                     }}>
                  PRESSURE VESSEL
                </div>

                {/* Vessel Bolts */}
                <div className="absolute inset-0 pointer-events-none z-50">
                  {[...Array(16)].map((_, i) => {
                    const angle = (i / 16) * 360;
                    const x = 50 + 48 * Math.cos((angle * Math.PI) / 180);
                    const y = 50 + 48 * Math.sin((angle * Math.PI) / 180);
                    return (
                      <div key={i} 
                           className="absolute w-2 md:w-3 h-2 md:h-3 rounded-full bg-gray-500 border border-gray-700"
                           style={{ 
                             left: `${x}%`, 
                             top: `${y}%`,
                             boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.5), 0 1px 2px rgba(255,255,255,0.2)'
                           }} />
                    );
                  })}
                </div>

                {/* Boron Injection Visual */}
                {(currentAttack === 'rod_stuck_slow' || currentAttack === 'rod_stuck') && mitigationActive && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden z-10 pointer-events-none">
                    <div 
                      className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                      style={{ 
                        height: `${state.boronLevel}%`,
                        background: 'linear-gradient(to top, rgba(59, 130, 246, 0.6), rgba(59, 130, 246, 0.2))',
                        boxShadow: '0 -10px 40px rgba(59, 130, 246, 0.6)'
                      }}>
                      {[...Array(20)].map((_, i) => (
                        <div key={i}
                             className="absolute w-2 h-2 bg-blue-300 rounded-full animate-ping"
                             style={{
                               left: `${Math.random() * 100}%`,
                               bottom: `${Math.random() * 30}%`,
                               animationDelay: `${Math.random() * 2}s`,
                               animationDuration: '3s'
                             }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Core Glow */}
                <div className="absolute inset-0 rounded-lg backdrop-blur-sm z-0"
                     style={{
                       background: 'radial-gradient(ellipse at center, rgba(17, 24, 39, 0.8) 0%, rgba(0, 0, 0, 0.9) 100%)'
                     }}></div>

                {/* Fuel and Control Rods */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 md:w-[280px] h-72 md:h-[320px]">
                    
                    {/* Core Glow Effect */}
                    <div
                      className="absolute inset-0 rounded-lg transition-all duration-700"
                      style={{
                        background: `radial-gradient(circle at center, ${coreColor}55 0%, ${coreColor}22 40%, transparent 70%)`,
                        filter: 'blur(40px)',
                        animation: state.actualTemp > 350 ? 'pulse 1s infinite' : 'none'
                      }}
                    />

                    {state.actualTemp > 340 && (
                      <div
                        className="absolute inset-0 rounded-lg animate-pulse"
                        style={{
                          background: `radial-gradient(circle at center, ${coreColor}88 0%, transparent 50%)`,
                          filter: 'blur(60px)'
                        }}
                      />
                    )}

                    {/* Fuel Rods */}
                    <div className="absolute top-10 left-0 flex justify-center gap-2 md:gap-4 w-full">
                      {[...Array(8)].map((_, i) => {
                        const rodTemp = state.actualTemp + (Math.random() * 10 - 5);
                        const rodColor = getTempColor(rodTemp);
                        return (
                          <div key={i} className="relative group">
                            <div
                              className="absolute -inset-1 rounded-lg blur-md transition-all duration-300"
                              style={{
                                background: `linear-gradient(to bottom, ${rodColor}88, ${rodColor}44)`,
                                opacity: state.actualTemp > 320 ? 0.7 : 0.4
                              }}
                            />
                            
                            <div
                              className="relative w-5 md:w-7 h-48 md:h-56 rounded-lg shadow-inner transition-all duration-300"
                              style={{
                                background: `linear-gradient(to bottom, ${rodColor} 0%, ${rodColor}dd 50%, #78350f 90%)`,
                                boxShadow: `0 0 ${state.actualTemp > 340 ? '30px' : '20px'} ${rodColor}60, inset 0 2px 4px rgba(0,0,0,0.5)`,
                                animation: state.actualTemp > 350 ? 'pulse 0.5s infinite' : 'none'
                              }}
                            />

                            {state.actualTemp > 350 && (
                              <>
                                {[...Array(3)].map((_, j) => (
                                  <div key={j}
                                       className="absolute w-2 h-2 bg-gray-300 rounded-full opacity-40"
                                       style={{
                                         left: '50%',
                                         bottom: '100%',
                                         animation: `float ${2 + j * 0.5}s infinite`,
                                         animationDelay: `${j * 0.3}s`
                                       }} />
                                ))}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Control Rods */}
                    <div
                      className="absolute flex justify-center gap-2 md:gap-4 w-full transition-all duration-700 z-20"
                      style={{
                        top: `${20 + (state.rodPosition * 2.4)}px`,
                      }}
                    >
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 w-5 md:w-6 h-5 md:h-6 rounded border-2 border-gray-400"
                               style={{
                                 background: 'linear-gradient(145deg, #9ca3af, #6b7280)',
                                 boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                               }}>
                            <div className="w-1 h-2 bg-gray-600 mx-auto"></div>
                          </div>

                          <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-500"
                               style={{ height: '12px' }} />

                          <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2 w-4 md:w-5 h-4 md:h-5 bg-gray-500 border-2 border-gray-300 rounded-t"
                               style={{
                                 boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
                               }} />
                          
                          <div className="w-5 md:w-7 h-44 md:h-52 rounded-lg border border-gray-700 shadow-2xl relative overflow-hidden"
                               style={{
                                 background: 'linear-gradient(to bottom, #e5e7eb 0%, #9ca3af 30%, #6b7280 60%, #374151 100%)',
                                 boxShadow: '0 4px 6px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,255,255,0.3), inset -1px 0 2px rgba(0,0,0,0.3)'
                               }}>
                            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white to-transparent opacity-50"></div>
                            <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent to-black opacity-30"></div>
                          </div>

                          {(currentAttack === 'rod_stuck_slow') && (
                            <div className="absolute -right-2 md:-right-3 -top-2 text-yellow-500 text-base md:text-xl animate-bounce">⚠️</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Core Temperature Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
                      <div className="text-lg md:text-2xl font-bold text-white tracking-widest drop-shadow-lg"
                           style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
                        REACTOR CORE
                      </div>
                      <div className="text-3xl md:text-4xl font-extrabold mt-1 drop-shadow-lg" 
                           style={{ 
                             color: coreColor,
                             textShadow: `0 0 20px ${coreColor}, 0 0 40px ${coreColor}88`,
                             animation: state.actualTemp > 350 ? 'pulse 1s infinite' : 'none'
                           }}>
                        {state.actualTemp.toFixed(0)}°C
                      </div>
                      {state.actualTemp > 350 && (
                        <div className="text-red-500 text-xs md:text-sm font-bold mt-1 animate-pulse">⚠️ CRITICAL TEMP ⚠️</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning Labels */}
                {state.flow > 22000 && (
                  <div className="absolute top-4 right-4 px-2 md:px-3 py-1 rounded font-bold animate-pulse z-30 text-xs md:text-sm"
                       style={{
                         background: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
                         boxShadow: '0 4px 6px rgba(37, 99, 235, 0.5), 0 0 20px rgba(37, 99, 235, 0.3)'
                       }}>
                    ⚠️ OVERFLOW!
                  </div>
                )}

                {state.flow < 12000 && (
                  <div className="absolute top-4 left-4 px-2 md:px-3 py-1 rounded font-bold animate-pulse z-30 text-xs md:text-sm"
                       style={{
                         background: 'linear-gradient(145deg, #dc2626, #b91c1c)',
                         boxShadow: '0 4px 6px rgba(220, 38, 38, 0.5), 0 0 20px rgba(220, 38, 38, 0.3)'
                       }}>
                    ⚠️ LOW FLOW!
                  </div>
                )}

                {state.status === 'critical' && (
                  <div className="absolute inset-0 rounded-lg border-4 border-red-500 animate-pulse pointer-events-none z-40"
                       style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 30px rgba(239, 68, 68, 0.3)' }}></div>
                )}
              </div>

              {/* Coolant Outlet */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="w-6 md:w-8 mx-auto bg-orange-800 border-2 border-orange-600 h-8 md:h-10">
                  {state.flow > 5000 && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <div key={i}
                             className="w-3 h-3 rounded-full mx-auto my-1 animate-ping"
                             style={{ 
                               opacity: flowOpacity, 
                               animationDelay: `${i * 0.3}s`,
                               backgroundColor: getTempColor(state.actualTemp + 20)
                             }} />
                      ))}
                    </>
                  )}
                </div>
                <div className="w-20 md:w-24 h-12 md:h-16 bg-orange-900 border-4 border-orange-700 rounded-b-lg flex items-center justify-center">
                  <Activity className="w-6 md:w-8 h-6 md:h-8 text-orange-400" />
                </div>
                <div className="text-center mt-2 font-bold text-orange-400 text-xs md:text-sm">COOLANT OUTLET</div>
              </div>

              {/* Pressure Gauge */}
              <div className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-gray-800 p-3 md:p-4 rounded-lg border-2 border-gray-600">
                <div className="text-center font-bold mb-2 text-xs md:text-sm">PRESSURE</div>
                <div className="relative w-16 md:w-24 h-16 md:h-24">
                  <Gauge className={`w-16 md:w-24 h-16 md:h-24 ${state.pressure > 180 ? 'text-red-500' : state.pressure > 165 ? 'text-yellow-500' : 'text-green-500'}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold">{state.pressure.toFixed(0)}</div>
                      <div className="text-xs">Bar</div>
                    </div>
                  </div>
                </div>
                {state.pressure > 180 && (
                  <div className="text-red-500 text-xs font-bold animate-pulse mt-2">CRITICAL!</div>
                )}
              </div>

              {/* Legend */}
              <div className="absolute top-4 right-4 bg-gray-800 p-2 md:p-3 rounded-lg border-2 border-gray-600 text-xs md:text-sm">
                <div className="font-bold mb-2">LEGEND</div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 md:w-4 h-3 md:h-4 bg-yellow-600 rounded border border-yellow-800" />
                  <span>Fuel Rods</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 md:w-4 h-3 md:h-4 bg-gray-400 rounded border border-gray-600" />
                  <span>Control Rods</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-3 md:w-4 h-3 md:h-4 text-cyan-400" />
                  <span>Coolant</span>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="absolute bottom-8 left-4 md:left-8 space-y-2">
                <div className="bg-gray-800 px-3 md:px-4 py-2 rounded-lg border-2 border-gray-600">
                  <div className="text-xs text-gray-400">COOLANT FLOW</div>
                  <div className="flex items-center gap-2">
                    <Droplets className={`w-4 md:w-5 h-4 md:h-5 ${state.flow < 12000 ? 'text-red-500' : 'text-cyan-400'}`} />
                    <span className={`text-base md:text-xl font-bold ${state.flow < 12000 ? 'text-red-500' : state.flow > 22000 ? 'text-blue-400' : ''}`}>
                      {state.flow.toFixed(0)}
                    </span>
                    <span className="text-gray-400 text-xs md:text-sm">L/s</span>
                  </div>
                </div>

                <div className="bg-gray-800 px-3 md:px-4 py-2 rounded-lg border-2 border-gray-600">
                  <div className="text-xs text-gray-400">CONTROL RODS</div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 md:w-5 h-4 md:h-5 bg-gray-400 rounded border border-gray-600" />
                    <span className="text-base md:text-xl font-bold">{state.rodPosition.toFixed(0)}%</span>
                    <span className="text-xs text-gray-400">
                      {state.rodPosition > 40 ? 'OUT' : state.rodPosition > 10 ? 'IN' : 'FULL'}
                    </span>
                  </div>
                  {(currentAttack === 'rod_stuck_slow') && mitigationActive && (
                    <div className="text-red-400 text-xs font-bold mt-1">⚠️ STUCK</div>
                  )}
                </div>

                {mitigationSystems.boronInjection && (
                  <div className="bg-blue-900 px-3 md:px-4 py-2 rounded-lg border-2 border-blue-600">
                    <div className="text-xs text-blue-300">BORON</div>
                    <div className="flex items-center gap-2">
                      <div className="text-base md:text-xl font-bold text-blue-300">{state.boronLevel.toFixed(0)}%</div>
                    </div>
                    <div className="w-full bg-blue-950 rounded-full h-2 mt-1">
                      <div className="bg-blue-400 h-2 rounded-full transition-all" 
                           style={{ width: `${state.boronLevel}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
                  50% { transform: translateY(-20px) translateX(5px); opacity: 0.1; }
                }
              `}</style>
            </div>
          </div>

          {/* RIGHT COLUMN - Controls and Metrics */}
          <div className="xl:col-span-2 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            
            {/* AI Detection System */}
            {currentAttack && (
              <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-3 border-2 border-purple-600">
                <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-300" />
                  🤖 AI Detection
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-purple-200">Anomaly Score</span>
                      <span className={`font-bold ${aiDetectionScore > 0.65 ? 'text-red-400' : 'text-purple-300'}`}>
                        {(aiDetectionScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-950 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${
                        aiDetectionScore > 0.65 ? 'bg-red-500 animate-pulse' : 'bg-purple-400'
                      }`} 
                           style={{ width: `${Math.min(aiDetectionScore * 100, 100)}%` }} />
                    </div>
                    <div className="text-xs text-purple-300 mt-1">
                      {aiDetectionScore > 0.65 ? '⚠️ THREAT DETECTED!' : 'Monitoring...'}
                    </div>
                  </div>

                  {attackStartTime !== null && (
                    <div className="bg-purple-950 rounded p-3 space-y-2">
                      <div className="text-sm font-bold text-purple-200">Detection Timeline:</div>
                      
                      {aiDetectionTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 font-bold">
                            🤖 AI: {aiDetectionTime.toFixed(1)}s
                          </span>
                        </div>
                      )}
                      
                      {thresholdDetectionTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span className="text-yellow-400">
                            📊 Threshold: {thresholdDetectionTime.toFixed(1)}s
                          </span>
                        </div>
                      )}

                      {!aiDetectionTime && !thresholdDetectionTime && (
                        <div className="text-yellow-400 text-sm">
                          ⏳ {(time - attackStartTime).toFixed(1)}s elapsed
                        </div>
                      )}

                      {aiDetectionTime && thresholdDetectionTime && (
                        <div className="mt-2 p-2 bg-green-900 rounded border border-green-600">
                          <div className="text-xs font-bold text-green-300">
                            ✅ AI was {(thresholdDetectionTime / aiDetectionTime).toFixed(1)}x FASTER!
                          </div>
                          <div className="text-xs text-green-400">
                            Saved {(thresholdDetectionTime - aiDetectionTime).toFixed(1)}s
                          </div>
                        </div>
                      )}

                      {aiDetectionTime && !thresholdDetectionTime && currentAttack === 'replay' && (
                        <div className="mt-2 p-2 bg-red-900 rounded border border-red-600">
                          <div className="text-xs font-bold text-red-300">
                            🎯 AI ONLY DEFENSE!
                          </div>
                          <div className="text-xs text-red-400">
                            Threshold never detected
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Active Mitigation */}
            {mitigationActive && (
              <div className="bg-blue-900 rounded-lg p-3 border-2 border-blue-600">
                <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-300" />
                  Active Mitigation
                </h3>

                <div className="space-y-2 text-sm">
                  {mitigationSystems.emergencyCooling && (
                    <div className="flex items-center gap-2 p-2 bg-blue-800 rounded">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                      <span className="font-bold">💧 Emergency Cooling</span>
                    </div>
                  )}

                  {mitigationSystems.pressureRelief && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-900 rounded">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="font-bold">💨 Pressure Relief</span>
                    </div>
                  )}

                  {mitigationSystems.boronInjection && (
                    <div className="flex items-center gap-2 p-2 bg-blue-800 rounded">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                      <span className="font-bold">💉 Boron - {state.boronLevel.toFixed(0)}%</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                    <div className={`w-3 h-3 rounded-full ${
                      mitigationSystems.controlRods === 'stuck' ? 'bg-red-500' : 'bg-gray-400'
                    } animate-pulse`} />
                    <span className="font-bold text-xs md:text-sm">
                      🎛️ Rods: {
                        mitigationSystems.controlRods === 'stuck' ? 'STUCK' :
                        mitigationSystems.controlRods === 'scram' ? 'SCRAM' :
                        mitigationSystems.controlRods === 'fast_scram' ? 'FAST SCRAM' :
                        mitigationSystems.controlRods === 'partial' ? 'PARTIAL' :
                        'Normal'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Physics Twin */}
            <div className="bg-gradient-to-br from-green-900 to-teal-900 rounded-lg p-3 border-2 border-green-600">
              <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-300" />
                🔬 Physics Twin
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-green-950 rounded">
                  <span className="text-green-300">Predicted Temp:</span>
                  <span className="font-bold text-green-200">{physicsTwin.predictedTemp.toFixed(1)}°C</span>
                </div>
                
                <div className="flex justify-between p-2 bg-green-950 rounded">
                  <span className="text-green-300">Predicted Power:</span>
                  <span className="font-bold text-green-200">{physicsTwin.predictedPower.toFixed(0)} MW</span>
                </div>
                
                <div className="flex justify-between p-2 bg-green-950 rounded">
                  <span className="text-green-300">Predicted Pressure:</span>
                  <span className="font-bold text-green-200">{physicsTwin.predictedPressure.toFixed(0)} Bar</span>
                </div>

                {currentAttack && Math.abs(physicsTwin.predictedTemp - state.actualTemp) > 20 && (
                  <div className="mt-2 p-2 bg-red-900 rounded border border-red-600"><div className="text-xs font-bold text-red-300">
                      ⚠️ PHYSICS ANOMALY DETECTED!
                    </div>
                    <div className="text-xs text-red-400">
                      Deviation: {Math.abs(physicsTwin.predictedTemp - state.actualTemp).toFixed(1)}°C
                    </div>
                  </div>
                )}

                <div className="mt-2 p-2 bg-green-800 rounded border border-green-600">
                  <div className="text-xs text-green-200">
                    ℹ️ Physics Twin calculates expected behavior based on control inputs
                  </div>
                </div>
                {/* MODULE 3: Comparison Score */}
                <div className="mt-3 p-2 bg-yellow-900 rounded border border-yellow-600">
                  <div className="text-xs font-bold text-yellow-300 mb-1">📊 Physics Deviation Score</div>
                  <div className="text-xs text-yellow-200">
                    Overall: {(physicsDeviation.overallScore * 100).toFixed(0)}%
                  </div>
                  <div className="w-full bg-yellow-950 rounded-full h-2 mt-1">
                    <div className="bg-yellow-400 h-2 rounded-full transition-all" 
                         style={{ width: `${Math.min(physicsDeviation.overallScore * 100, 100)}%` }} />
                  </div>
                </div>

                {/* MODULE 4: Signal Analysis */}
                {currentAttack && (
                  <div className="mt-3 p-2 bg-indigo-900 rounded border border-indigo-600">
                    <div className="text-xs font-bold text-indigo-300 mb-1">🔍 Signal Analysis</div>
                    <div className="text-xs text-indigo-200">
                      Variance Score: {(signalAnalysis.varianceScore * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-indigo-200">
                      Entropy Score: {(signalAnalysis.entropyScore * 100).toFixed(0)}%
                    </div>
                    {signalAnalysis.varianceScore > 0.5 && (
                      <div className="text-xs text-red-400 mt-1">⚠️ Low variance detected!</div>
                    )}
                  </div>
                )}

                {/* MODULE 5: Challenge-Response */}
                {currentAttack && challengeResponse.testsPassed + challengeResponse.testsFailed > 0 && (
                  <div className="mt-3 p-2 bg-purple-900 rounded border border-purple-600">
                    <div className="text-xs font-bold text-purple-300 mb-1">🎯 Challenge-Response</div>
                    <div className="text-xs text-purple-200">
                      Passed: {challengeResponse.testsPassed} | Failed: {challengeResponse.testsFailed}
                    </div>
                    {challengeResponse.testsFailed > 0 && (
                      <div className="text-xs text-red-400 mt-1">⚠️ Sensor not responding to control changes!</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t-2 border-gray-700 my-4"></div>    
            {/* Live Metrics */}
            <div className="bg-gray-800 rounded-lg p-3 border-2 border-gray-700">
              <h3 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Metrics
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Core Temperature</span>
                    <span className="font-bold text-lg" style={{ color: getTempColor(state.actualTemp) }}>
                      {state.actualTemp.toFixed(0)}°C
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="h-3 rounded-full transition-all" 
                         style={{ 
                           width: `${Math.min((state.actualTemp / 500) * 100, 100)}%`,
                           backgroundColor: getTempColor(state.actualTemp)
                         }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Safe: 250-320°C | Critical: &gt;350°C</div>

                  {(currentAttack === 'slow_drift' || currentAttack === 'replay') && Math.abs(state.displayedTemp - state.actualTemp) > 10 && (
                    <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded text-xs">
                      <div className="font-bold text-red-400">⚠️ SENSOR SPOOFING DETECTED</div>
                      <div>Displayed: {state.displayedTemp.toFixed(0)}°C (FAKE)</div>
                      <div>Actual: {state.actualTemp.toFixed(0)}°C (REAL)</div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Reactor Power</span>
                    <span className={`font-bold text-lg ${state.power > 3000 ? 'text-red-500' : 'text-yellow-400'}`}>
                      {state.power.toFixed(0)} MW
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-yellow-400 h-3 rounded-full transition-all" 
                         style={{ width: `${Math.min((state.power / 5000) * 100, 100)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Normal: 1800-2200 MW | Critical: &gt;3500 MW</div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Coolant Flow</span>
                    <span className={`font-bold text-lg ${state.flow < 12000 ? 'text-red-500' : state.flow > 22000 ? 'text-blue-400' : 'text-cyan-400'}`}>
                      {state.flow.toFixed(0)} L/s
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-cyan-400 h-3 rounded-full transition-all" 
                         style={{ width: `${Math.min((state.flow / 28000) * 100, 100)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Safe: 16000-20000 L/s | Min: 12000 | Max: 22000</div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Vessel Pressure</span>
                    <span className={`font-bold text-lg ${state.pressure > 180 ? 'text-red-500' : state.pressure > 165 ? 'text-yellow-500' : 'text-green-400'}`}>
                      {state.pressure.toFixed(0)} Bar
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className={`h-3 rounded-full transition-all ${
                      state.pressure > 180 ? 'bg-red-500' : state.pressure > 165 ? 'bg-yellow-500' : 'bg-green-400'
                    }`} 
                         style={{ width: `${Math.min((state.pressure / 200) * 100, 100)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Safe: 150-165 Bar | Critical: &gt;180 Bar</div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-700 my-4"></div>        
            {/* Attack Scenarios */}
            <div className="bg-gray-800 rounded-lg p-3 border-2 border-gray-700">
              <h3 className="text-lg md:text-xl font-bold mb-3">Attack Scenarios</h3>
              
              <div className="mb-4 p-3 bg-blue-900 rounded border border-blue-700">
                <div className="text-sm font-bold text-blue-300 mb-2">⚡ FAST ATTACKS</div>
                <div className="text-xs text-blue-200">Threshold detection works</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => triggerAttack('loca', 'Loss of Coolant Accident')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  💧 LOCA (Fast)
                </button>

                <button
                  onClick={() => triggerAttack('overflow', 'Coolant Overflow')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  🌊 Overflow (Fast)
                </button>

                <button
                  onClick={() => triggerAttack('power_spike', 'Power Excursion')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  ⚡ Power Spike (Fast)
                </button>
              </div>

              <div className="mb-4 p-3 bg-purple-900 rounded border border-purple-700">
                <div className="text-sm font-bold text-purple-300 mb-2">🕵️ STEALTH ATTACKS</div>
                <div className="text-xs text-purple-200">AI catches them 20-30x faster</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => triggerAttack('slow_drift', 'Slow Temperature Drift with Spoofing')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  🐌 Slow Drift
                </button>

                <button
                  onClick={() => triggerAttack('coordinated', 'Coordinated Multi-Parameter Attack')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  🎭 Coordinated
                </button>

                <button
                  onClick={() => triggerAttack('replay', 'Replay Attack with Sensor Spoofing')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  📼 Replay Attack
                </button>

                <button
                  onClick={() => triggerAttack('rod_stuck_slow', 'Control Rod Stuck (Slow)')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  🎯 Rod Stuck (Slow)
                </button>

                <button
                  onClick={() => triggerAttack('pressure_slow', 'Slow Pressure Buildup')}
                  disabled={currentAttack !== null}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                >
                  💥 Pressure (Slow)
                </button>
              </div>

              <button
                onClick={reset}
                className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-bold transition-colors text-sm"
              >
                🔄 Reset System
              </button>
            </div>

            {/* Event Log */}
            <div className="bg-gray-800 rounded-lg p-3 border-2 border-gray-700 max-h-64 overflow-y-auto">
              <h3 className="text-lg md:text-xl font-bold mb-3">Event Log</h3>
              <div className="space-y-1 font-mono text-xs">
                {eventLog.map((log, i) => (
                  <div key={i} className={`p-2 rounded ${
                    log.includes('🚨') ? 'bg-red-900 text-red-200' :
                    log.includes('🛡️') ? 'bg-blue-900 text-blue-200' :
                    log.includes('🤖') ? 'bg-purple-900 text-purple-200' :
                    log.includes('⚠️') ? 'bg-yellow-900 text-yellow-200' :
                    'bg-gray-700'
                  }`}>
                    [{(time).toFixed(1)}s] {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}