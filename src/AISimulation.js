  import React, { useState, useEffect, useRef } from 'react';
import { Activity, AlertTriangle, Droplets, Gauge, Shield, Brain, Zap, Eye, ArrowLeftRight } from 'lucide-react';
  

  export default function AISimulation(props) {
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
    const [eventLog, setEventLog] = useState([
    { time: 0, message: '✅ System initialized' },
    { time: 0, message: '✅ All systems nominal' }
  ]);
    const [time, setTime] = useState(0);
    const [aiDetectionScore, setAiDetectionScore] = useState(0);
    const [fusionAnalysis, setFusionAnalysis] = useState({
    fusedScore: 0,
    confidence: 0,
    attackType: 'NONE',
    contributingSources: []
  });
    const [aiDetectionTime, setAiDetectionTime] = useState(null);
    const [thresholdDetectionTime, setThresholdDetectionTime] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [attackStartTime, setAttackStartTime] = useState(null);
    const [preliminaryDetectionTime, setPreliminaryDetectionTime] = useState(null);
  const [buildingConfidence, setBuildingConfidence] = useState(false);
  const [exportData, setExportData] = useState([]);
    
  const [physicsTwin, setPhysicsTwin] = useState({
    predictedTemp: 280,
    predictedPower: 2000,
    predictedPressure: 155,
    predictedFlow: 18000,
    neutronFlux: 1.0,
    thermalEnergy: 0,
    reactivity: 0,
    // NEW: Delayed neutron precursors (6 groups)
    precursors: [0.00021, 0.00142, 0.00127, 0.00257, 0.00075, 0.00027],
    // NEW: Xenon poisoning
    xenonConcentration: 0,
    iodineConcentration: 0
  });

    const [physicsDeviation, setPhysicsDeviation] = useState({
      tempDev: 0,
      powerDev: 0,
      pressureDev: 0,
      overallScore: 0
    });
    // ADD THIS after physicsDeviation state (around line 80):
  const [comparisonAlerts, setComparisonAlerts] = useState([]);

    const [signalAnalysis, setSignalAnalysis] = useState({
      autocorrelation: 0,
      varianceScore: 0,
      entropyScore: 0
    });

  const [challengeResponse, setChallengeResponse] = useState({
    active: false,
    challengeType: null,
    challengeMagnitude: 0,
    startState: null,
    expectedResponse: null,
    actualResponse: null,
    testsPassed: 0,
    testsFailed: 0,
    lastTest: 0,
    currentTest: null
  });

  const addLog = (message) => {
    setEventLog(prev => [...prev.slice(-11), { time: time, message: message }]);
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

    const calculatePhysicsDeviation = (sensorState, physicsState) => {
      const tempDev = Math.abs(sensorState.actualTemp - physicsState.predictedTemp);
      const powerDev = Math.abs(sensorState.power - physicsState.predictedPower);
      const pressureDev = Math.abs(sensorState.pressure - physicsState.predictedPressure);
      
      const tempScore = Math.min(tempDev / 100, 1.0);
      const powerScore = Math.min(powerDev / 2000, 1.0);
      const pressureScore = Math.min(pressureDev / 50, 1.0);
      
      const overallScore = (tempScore * 0.6) + (powerScore * 0.4) + (pressureScore * 0.3); 
      
      return { tempDev, powerDev, pressureDev, overallScore };
    };

    const exportToCSV = () => {
  if (exportData.length === 0) {
    alert('No data to export. Run an attack first!');
    return;
  }

  // CSV Headers
  const headers = [
    'Timestamp',
    'Attack_Type',
    'Actual_Temp',
    'Displayed_Temp',
    'Power',
    'Flow',
    'Pressure',
    'Rod_Position',
    'Boron_Level',
    'Physics_Predicted_Temp',
    'Physics_Predicted_Power',
    'Physics_Predicted_Pressure',
    'Physics_Deviation_Overall',
    'AI_Anomaly_Score',
    'AI_Fused_Score',
    'Mitigation_Active',
    'Status'
  ].join(',');

  // CSV Rows
  const rows = exportData.map(row => [
    row.timestamp.toFixed(2),
    row.attackType || 'none',
    row.actualTemp.toFixed(2),
    row.displayedTemp.toFixed(2),
    row.power.toFixed(2),
    row.flow.toFixed(2),
    row.pressure.toFixed(2),
    row.rodPosition.toFixed(2),
    row.boronLevel.toFixed(2),
    row.physicsPredictedTemp.toFixed(2),
    row.physicsPredictedPower.toFixed(2),
    row.physicsPredictedPressure.toFixed(2),
    row.physicsDeviationOverall.toFixed(4),
    row.aiAnomalyScore.toFixed(4),
    row.aiFusedScore.toFixed(4),
    row.mitigationActive ? 1 : 0,
    row.status
  ].join(','));

  const csv = [headers, ...rows].join('\n');
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reactor_attack_${currentAttack}_${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const exportSummaryJSON = () => {
  if (!currentAttack || !attackStartTime) {
    alert('No attack data to export. Run an attack first!');
    return;
  }

  const summary = {
    attack_type: currentAttack,
    ai_detection_time: aiDetectionTime,
    threshold_detection_time: thresholdDetectionTime,
    speed_advantage: thresholdDetectionTime && aiDetectionTime 
      ? (thresholdDetectionTime / aiDetectionTime).toFixed(2) + 'x'
      : 'N/A',
    final_state: {
      temperature: state.actualTemp,
      power: state.power,
      flow: state.flow,
      pressure: state.pressure
    },
    data_points: exportData.length
  };

  const json = JSON.stringify(summary, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `summary_${currentAttack}_${Date.now()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};

    const generateComparisonAlerts = (deviation, sensorState, physicsState) => {
    const alerts = [];
    const timestamp = time.toFixed(1);
    
    // Critical overall mismatch
    if (deviation.overallScore > 0.8) {
      alerts.push({
        id: `alert-${Date.now()}-critical`,
        level: 'CRITICAL',
        message: 'Severe physics-sensor mismatch detected',
        detail: `Overall deviation: ${(deviation.overallScore * 100).toFixed(0)}%`,
        action: 'IMMEDIATE_SCRAM',
        confidence: 0.95,
        timestamp
      });
    } else if (deviation.overallScore > 0.6) {
      alerts.push({
        id: `alert-${Date.now()}-high`,
        level: 'HIGH',
        message: 'Significant deviation detected',
        detail: `Overall deviation: ${(deviation.overallScore * 100).toFixed(0)}%`,
        action: 'ENHANCED_MONITORING',
        confidence: 0.80,
        timestamp
      });
    }
    
    // Temperature-specific alerts
    if (deviation.tempDev > 30) {
      alerts.push({
        id: `alert-${Date.now()}-temp`,
        level: deviation.tempDev > 50 ? 'CRITICAL' : 'WARNING',
        message: 'Temperature sensor anomaly',
        detail: `Sensor: ${sensorState.actualTemp.toFixed(1)}°C, Physics: ${physicsState.predictedTemp.toFixed(1)}°C, Δ=${deviation.tempDev.toFixed(1)}°C`,
        action: 'VERIFY_TEMP_SENSOR',
        confidence: Math.min(deviation.tempDev / 50, 1.0),
        timestamp
      });
    }
    
    // Power-specific alerts
    if (deviation.powerDev > 400) {
      alerts.push({
        id: `alert-${Date.now()}-power`,
        level: deviation.powerDev > 800 ? 'CRITICAL' : 'WARNING',
        message: 'Power measurement anomaly',
        detail: `Sensor: ${sensorState.power.toFixed(0)}MW, Physics: ${physicsState.predictedPower.toFixed(0)}MW, Δ=${deviation.powerDev.toFixed(0)}MW`,
        action: 'VERIFY_POWER_SENSOR',
        confidence: Math.min(deviation.powerDev / 800, 1.0),
        timestamp
      });
    }
    
    // Pressure-specific alerts
    if (deviation.pressureDev > 15) {
      alerts.push({
        id: `alert-${Date.now()}-pressure`,
        level: deviation.pressureDev > 25 ? 'CRITICAL' : 'WARNING',
        message: 'Pressure sensor anomaly',
        detail: `Sensor: ${sensorState.pressure.toFixed(0)}Bar, Physics: ${physicsState.predictedPressure.toFixed(0)}Bar, Δ=${deviation.pressureDev.toFixed(0)}Bar`,
        action: 'VERIFY_PRESSURE_SENSOR',
        confidence: Math.min(deviation.pressureDev / 25, 1.0),
        timestamp
      });
    }
    
    return alerts;
  };

  // ADD THIS FUNCTION after generateComparisonAlerts (around line 200):
const executeChallengeResponse = (currentState, physicsModel, currentTime, isFirstTest = false) => {
  // Don't test too frequently (unless it's the first test)
  if (!isFirstTest && currentTime - challengeResponse.lastTest < 4) return null;
    
    // Don't test during active mitigation
    if (mitigationActive) return null;
    
    // Define challenge types
    const challenges = [
      {
        type: 'rod_pulse',
        description: 'Control rod micro-movement',
        magnitude: 2, // 2% rod movement
        duration: 3, // 4 seconds
        expectedTempChange: 1.2, // Expected ΔT in °C
        expectedPowerChange: 25, // Expected ΔP in MW
        threshold: 0.6 // Acceptable deviation
      },
      {
        type: 'flow_step',
        description: 'Coolant flow pulse',
        magnitude: 500, // 500 L/s increase
        duration: 3,
        expectedTempChange: -0.8,
        expectedPowerChange: 0,
        threshold: 0.5
      },
      {
        type: 'rod_ramp',
        description: 'Gradual rod insertion',
        magnitude: 1, // 1% slow movement
        duration: 5,
        expectedTempChange: 0.6,
        expectedPowerChange: 12,
        threshold: 0.7
      }
    ];
    
    // Select random challenge
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return {
      ...challenge,
      startTime: currentTime,
      startState: {
        temp: currentState.actualTemp,
        power: currentState.power,
        rodPosition: currentState.rodPosition,
        flow: currentState.flow
      }
    };
  };

  const evaluateChallengeResponse = (challenge, currentState, startState, elapsedTime) => {
    // Has enough time passed?
    if (elapsedTime < challenge.duration) {
      return { complete: false };
    }
    
    // Calculate actual changes
    const actualTempChange = currentState.actualTemp - startState.temp;
    const actualPowerChange = currentState.power - startState.power;
    
    // Calculate deviations from expected
    const tempDeviation = Math.abs(actualTempChange - challenge.expectedTempChange);
    const powerDeviation = Math.abs(actualPowerChange - challenge.expectedPowerChange);
    
    // Normalize deviations
    const normalizedTempDev = tempDeviation / Math.abs(challenge.expectedTempChange + 0.1);
    const normalizedPowerDev = powerDeviation / Math.abs(challenge.expectedPowerChange + 1);
    
    // Overall deviation score
    const overallDeviation = (normalizedTempDev * 0.6) + (normalizedPowerDev * 0.4);
    
    // Determine if spoofing detected
    const adjustedThreshold = challenge.threshold * 1.5; // 50% more tolerance
const spoofDetected = overallDeviation > adjustedThreshold;
    
  return {
    complete: true,
    actualTempChange,
    actualPowerChange,
    tempDeviation,
    powerDeviation,
    overallDeviation,
    spoofDetected,
    passed: !spoofDetected,
    expectedTempChange: challenge.expectedTempChange,
    expectedPowerChange: challenge.expectedPowerChange
  };
  };

  // ADD THIS FUNCTION after evaluateChallengeResponse (around line 280):
  const fuseDetectionScores = (sources) => {
    const {
      physicsDeviation,
      signalAnalysis,
      challengeResponse,
      statisticalAnomaly
    } = sources;
    
    // Module weights (can be tuned)
    const weights = {
      physics: 0.25,      // Highest - twin mismatch is strongest signal
      challenge: 0.25,    // Second - active testing
      signal: 0.25,       // Third - passive pattern analysis
      statistical: 0.25   // Fourth - ML anomaly detection
    };
    
    // Calculate individual scores
    const physicsScore = physicsDeviation?.overallScore || 0;
    const challengeScore = challengeResponse?.actualResponse?.overallDeviation || 0;
    const signalScore = Math.max(
      signalAnalysis?.varianceScore || 0,
      signalAnalysis?.entropyScore || 0,
      signalAnalysis?.spectralScore || 0
    );
    const statScore = statisticalAnomaly || 0;
    
    // Weighted fusion
    const fusedScore = 
      physicsScore * weights.physics +
      challengeScore * weights.challenge +
      signalScore * weights.signal +
      statScore * weights.statistical;

      const clampedScore = Math.min(fusedScore, 1.0);
      
    
    // Calculate confidence based on agreement between sources
    const scores = [physicsScore, challengeScore, signalScore, statScore];
    const activeScores = scores.filter(s => s > 0.3);
    const agreement = activeScores.length >= 2 ? 
      (activeScores.filter(s => s > 0.5).length / activeScores.length) : 0.5;
    const confidence = Math.min(agreement * 1.2, 1.0);
    
    
    // Classify attack type
    let attackType = 'NONE';
    const contributingSources = [];
    
    if (fusedScore > 0.3) {
      // Sensor spoofing: High physics deviation, normal/low signal variance
      if (physicsScore > 0.6 && signalScore < 0.4) {
        attackType = 'SENSOR_SPOOFING';
        contributingSources.push('Physics Twin Mismatch');
      }
      
      // Replay attack: High signal scores (low variance, low entropy)
      if (signalScore > 0.6 && (signalAnalysis?.varianceScore > 0.7 || signalAnalysis?.entropyScore > 0.6)) {
        attackType = 'REPLAY_ATTACK';
        contributingSources.push('Signal Pattern Analysis');
      }
      
      // Challenge failure: Sensors not responding correctly
      if (challengeScore > 0.6) {
        attackType = attackType === 'NONE' ? 'SENSOR_COMPROMISE' : 'COORDINATED_ATTACK';
        contributingSources.push('Challenge-Response Test');
      }
      
      // Coordinated: Multiple high scores
      const highScoreCount = scores.filter(s => s > 0.5).length;
      if (highScoreCount >= 3) {
        attackType = 'COORDINATED_ATTACK';
        if (physicsScore > 0.5) contributingSources.push('Physics Twin');
        if (signalScore > 0.5) contributingSources.push('Signal Analysis');
        if (challengeScore > 0.5) contributingSources.push('Challenge-Response');
        if (statScore > 0.5) contributingSources.push('Statistical ML');
      }
      
      // If still NONE but we have a score
      if (attackType === 'NONE' && fusedScore > 0.5) {
        attackType = 'UNKNOWN_ANOMALY';
        if (physicsScore > 0.3) contributingSources.push('Physics Twin');
        if (signalScore > 0.3) contributingSources.push('Signal Analysis');
        if (statScore > 0.3) contributingSources.push('Statistical ML');
      }
    }
    
    // Determine mitigation strategy
    const shouldMitigate = fusedScore > 0.75 && confidence > 0.70;
    
    return {
      fusedScore: clampedScore,
      confidence,
      attackType,
      contributingSources,
      shouldMitigate,
      breakdown: {
        physics: physicsScore,
        challenge: challengeScore,
        signal: signalScore,
        statistical: statScore
      }
    };
  };

  const analyzeSignalPatterns = (history) => {
    if (history.length < 10) return {
      autocorrelation: 0, 
      varianceScore: 0, 
      entropyScore: 0,
      spectralScore: 0,
      periodicity: 0
    };
    
    const recent = history.slice(-20);
    const temps = recent.map(d => d.actualTemp);
    
    // 1. Autocorrelation (existing)
    let autocorr = 0;
    for (let lag = 1; lag <= 5; lag++) {
      let sum = 0;
      for (let i = lag; i < temps.length; i++) {
        sum += temps[i] * temps[i - lag];
      }
      autocorr += Math.abs(sum / (temps.length - lag));
    }
    autocorr = autocorr / 5 / 100000;
    
    // 2. Variance analysis (existing)
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const variance = temps.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / temps.length;
    const varianceScore = variance < 0.5 ? 0.8 : Math.max(0, 1 - variance / 10);
    
    // 3. Entropy (existing)
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
    
    // 4. NEW: Simple spectral analysis (detect repeating patterns)
    let maxPeriodicity = 0;
    for (let period = 2; period <= 10; period++) {
      let correlation = 0;
      let count = 0;
      for (let i = period; i < temps.length; i++) {
        correlation += Math.abs(temps[i] - temps[i - period]);
        count++;
      }
      const avgDiff = correlation / count;
      const periodicity = 1 - Math.min(avgDiff / 5, 1); // Low diff = high periodicity
      maxPeriodicity = Math.max(maxPeriodicity, periodicity);
    }
    
    // 5. NEW: Spectral score (too periodic = suspicious)
    const spectralScore = maxPeriodicity > 0.8 ? 0.7 : 0;
    
    // 6. NEW: First-order differences (check if changes are too uniform)
    const diffs = [];
    for (let i = 1; i < temps.length; i++) {
      diffs.push(Math.abs(temps[i] - temps[i-1]));
    }
    const diffMean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const diffVariance = diffs.reduce((sum, d) => sum + Math.pow(d - diffMean, 2), 0) / diffs.length;
    const diffStability = diffVariance < 0.01 ? 0.6 : 0; // Too stable changes = suspicious
    
    return { 
      autocorrelation: autocorr, 
      varianceScore, 
      entropyScore,
      spectralScore,
      periodicity: maxPeriodicity,
      diffStability
    };
  };


    const calculateAnomalyScore = (currentState, history) => {
      if (history.length < 10) return 0;
      
      let anomalyScore = 0;
      const recent = history.slice(-10);
      
      const avgTemp = recent.reduce((sum, d) => sum + d.actualTemp, 0) / recent.length;
      const avgFlow = recent.reduce((sum, d) => sum + d.flow, 0) / recent.length;
      const avgPower = recent.reduce((sum, d) => sum + d.power, 0) / recent.length;
      
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
      
      const physicsTempDev = Math.abs(currentState.actualTemp - physicsTwin.predictedTemp) / 50;
      anomalyScore += Math.min(physicsTempDev * 0.25, 0.4);
      
      const physicsPowerDev = Math.abs(currentState.power - physicsTwin.predictedPower) / 1000;
      anomalyScore += Math.min(physicsPowerDev * 0.15, 0.3);
      
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
      setEventLog([
    { time: 0, message: '✅ System reset' },
    { time: 0, message: '✅ All systems nominal' }
  ]);
      setTime(0);
      setAiDetectionScore(0);
      setAiDetectionTime(null);
      setThresholdDetectionTime(null);
      setHistoricalData([]);
      setAttackStartTime(null);
      setPreliminaryDetectionTime(null);
  setBuildingConfidence(false);
 setExportData([]);
};

  const calculatePhysicsTwin = (prevPhysics, controlInputs, deltaTime) => {
    const { rodPosition, boronLevel, targetFlow } = controlInputs;
    
    // 1. Reactivity calculation
    const rodReactivity = (50 - rodPosition) * 0.0002;
    const boronReactivity = -boronLevel * 0.00015;
    
    // NEW: Xenon reactivity (negative - it absorbs neutrons)
    const xenonReactivity = -prevPhysics.xenonConcentration * 0.00001;
    
    const totalReactivity = rodReactivity + boronReactivity + xenonReactivity;
    
    // 2. NEW: Delayed neutron dynamics
    const betaEffective = 0.0065; // Total delayed neutron fraction
    const lambda = [0.0124, 0.0305, 0.111, 0.301, 1.14, 3.01]; // Decay constants (1/s)
    const beta = [0.000215, 0.001424, 0.001274, 0.002568, 0.000748, 0.000273]; // Individual fractions
    
    let delayedNeutronContribution = 0;
    const newPrecursors = prevPhysics.precursors.map((C_i, i) => {
      // Precursor decay contributes delayed neutrons
      delayedNeutronContribution += lambda[i] * C_i;
      
      // Update precursor concentration
      // dC/dt = beta_i * flux - lambda_i * C_i
      const production = beta[i] * prevPhysics.neutronFlux;
      const decay = lambda[i] * C_i;
      return C_i + (production - decay) * deltaTime;
    });
    
    // 3. Neutron flux with delayed neutrons
    const promptNeutronLifetime = 0.00001; // 10 microseconds (typical for thermal reactor)
    const promptReactivity = totalReactivity - betaEffective;
    
    // Point kinetics equation: dφ/dt = [(ρ - β)/Λ] * φ + Σλ_i * C_i
    const promptComponent = (promptReactivity / promptNeutronLifetime) * prevPhysics.neutronFlux;
    const fluxChangeRate = promptComponent + delayedNeutronContribution;
    
    const newNeutronFlux = prevPhysics.neutronFlux + fluxChangeRate * deltaTime;
    const clampedFlux = Math.max(0.5, Math.min(2.0, newNeutronFlux));
    
    // 4. Power calculation (unchanged)
    const predictedPower = 2000 * clampedFlux;
    
    // 5. NEW: Xenon-135 and Iodine-135 dynamics
    const gammaXe = 0.003; // Xe-135 fission yield
    const gammaI = 0.061;  // I-135 fission yield
    const lambdaXe = 2.09e-5; // Xe-135 decay (1/s)
    const lambdaI = 2.87e-5;  // I-135 decay (1/s)
    const sigmaXe = 0.00001;  // Xe-135 absorption (simplified)
    
    // Iodine: dI/dt = γ_I * φ - λ_I * I
    const iodineProduction = gammaI * clampedFlux;
    const iodineDecay = lambdaI * prevPhysics.iodineConcentration;
    const newIodine = prevPhysics.iodineConcentration + (iodineProduction - iodineDecay) * deltaTime;
    
    // Xenon: dXe/dt = γ_Xe * φ + λ_I * I - λ_Xe * Xe - σ_Xe * Xe * φ
    const xenonProduction = gammaXe * clampedFlux + lambdaI * prevPhysics.iodineConcentration;
    const xenonDecay = lambdaXe * prevPhysics.xenonConcentration;
    const xenonBurnup = sigmaXe * prevPhysics.xenonConcentration * clampedFlux;
    const newXenon = prevPhysics.xenonConcentration + (xenonProduction - xenonDecay - xenonBurnup) * deltaTime;
    
    // 6. Heat generation and removal (unchanged)
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
      reactivity: totalReactivity,
      precursors: newPrecursors,
      xenonConcentration: Math.max(0, newXenon),
      iodineConcentration: Math.max(0, newIodine)
    };
  };

    useEffect(() => {
      const interval = setInterval(() => {
        setTime(t => t + 0.1);
        
  setState(prev => {
    const newPhysics = calculatePhysicsTwin(physicsTwin, {
      rodPosition: prev.rodPosition,
      boronLevel: prev.boronLevel,
      targetFlow: 18000
    }, 0.1);
    
    setPhysicsTwin(newPhysics);
    
    return prev; // Keep sensor state unchanged
  });

        setState(prev => {
          let newState = { ...prev };

  if (currentAttack === 'loca') {
    newState.flow = Math.max(5000, newState.flow - 200);
    
    // First: Let threshold detect WITHOUT checking mitigationActive
    if (newState.flow < 12000 && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold detected LOCA at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if (newState.flow < 12000 && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: true,
        pressureRelief: false,
        boronInjection: false,
        controlRods: 'scram'
      });
      addLog('🛡️ [THRESHOLD] Emergency cooling activated');
      addLog('🛡️ [THRESHOLD] Control rod SCRAM initiated');
    }
    
    if (mitigationActive) {
      newState.flow = Math.min(20000, newState.flow + 300);
      newState.rodPosition = Math.max(0, newState.rodPosition - 2);
    }
  }

  if (currentAttack === 'overflow') {
    newState.flow = Math.min(28000, newState.flow + 150);
    
    // First: Let threshold detect WITHOUT checking mitigationActive
    if (newState.flow > 22000 && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold detected overflow at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if (newState.flow > 22000 && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: false,
        pressureRelief: true,
        boronInjection: false,
        controlRods: 'partial'
      });
      addLog('🛡️ [THRESHOLD] Pressure relief valves opened');
      addLog('🛡️ [THRESHOLD] Partial control rod insertion');
    }
    
    if (mitigationActive) {
      newState.flow = Math.max(18000, newState.flow - 250);
      newState.rodPosition = Math.max(20, newState.rodPosition - 1);
    }
  }

  if (currentAttack === 'power_spike') {
    // During attack phase (before mitigation)
    if (!mitigationActive) {
      newState.power = Math.min(5000, newState.power + 50);
      newState.rodPosition = Math.min(100, newState.rodPosition + 1);
    }
    
    // First: Let threshold detect WITHOUT checking mitigationActive
    if (newState.power > 3500 && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold detected power spike at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if (newState.power > 3500 && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: true,
        pressureRelief: false,
        boronInjection: false,
        controlRods: 'fast_scram'
      });
      addLog('🛡️ [THRESHOLD] Power excursion detected');
      addLog('🛡️ [THRESHOLD] Fast SCRAM - rods fully inserted');
    }
    
    // During mitigation phase - actively bring power down
    if (mitigationActive) {
      newState.rodPosition = Math.max(0, newState.rodPosition - 4);
      newState.flow = Math.min(24000, newState.flow + 200);
      // Force power to decrease during SCRAM
      newState.power = Math.max(500, newState.power - 80);
    }
  }

  if (currentAttack === 'slow_drift') {
    // Attack: Slowly withdraw control rods to cause real drift
    if (!mitigationActive) {
      newState.rodPosition += 0.04; // subtle rod withdrawal
    }
    // Spoof the DISPLAY to hide the attack
    newState.displayedTemp = 285 + Math.sin(time * 0.3) * 5;
    // actualTemp will change naturally via physics below
    
    // First: Let threshold detect WITHOUT checking mitigationActive
    if (newState.actualTemp > 350 && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold FINALLY detected at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if (newState.actualTemp > 350 && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: true,
        pressureRelief: false,
        boronInjection: false,
        controlRods: 'scram'
      });
      addLog('🛡️ [THRESHOLD] Emergency systems activated (LATE!)');
    }
    
    if (mitigationActive) {
      newState.rodPosition = Math.max(0, newState.rodPosition - 2);
      newState.flow = Math.min(24000, newState.flow + 200);
    }
  }

  if (currentAttack === 'coordinated') {
    // Multi-vector: withdraw rods + reduce flow
    if (!mitigationActive) {
      newState.rodPosition += 0.06;
      newState.flow = Math.max(10000, newState.flow - 25);
    }
    // actualTemp and pressure will change naturally via physics
    
    // First: Let threshold detect WITHOUT checking mitigationActive
    if ((newState.actualTemp > 340 || newState.flow < 13000) && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold detected coordinated attack at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if ((newState.actualTemp > 340 || newState.flow < 13000) && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: true,
        pressureRelief: false,
        boronInjection: false,
        controlRods: 'scram'
      });
      addLog('🛡️ [THRESHOLD] Coordinated attack mitigation');
    }
    
    if (mitigationActive) {
      newState.rodPosition = Math.max(0, newState.rodPosition - 2);
      newState.flow = Math.min(22000, newState.flow + 300);
    }
  }

  if (currentAttack === 'replay') {
    // Attack: Aggressively withdraw rods
    if (!mitigationActive) {
      newState.rodPosition += 0.08;
    }
    // Replay old "safe" sensor data to display
    newState.displayedTemp = 285 + Math.sin(time * 0.2) * 3;
    // actualTemp will change naturally via physics
    
    // First: Let threshold detect WITHOUT checking mitigationActive
    if (newState.actualTemp > 370 && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold detected replay attack at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if (newState.actualTemp > 370 && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: true,
        pressureRelief: false,
        boronInjection: false,
        controlRods: 'fast_scram'
      });
      addLog('🛡️ [THRESHOLD] CRITICAL: Physical damage imminent!');
    }
    
    if (mitigationActive) {
      newState.rodPosition = Math.max(0, newState.rodPosition - 3);
      newState.flow = Math.min(26000, newState.flow + 400);
    }
  }


  if (currentAttack === 'rod_stuck_slow') {
    if (!mitigationActive) {
      newState.rodPosition = Math.min(75, newState.rodPosition + 0.3);
    }
    // First: Let threshold detect WITHOUT checking mitigationActive
    if (newState.power > 3200 && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold detected rod issue at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if (newState.power > 3200 && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: true,
        pressureRelief: false,
        boronInjection: true,
        controlRods: 'stuck'
      });
      addLog('⚠️ [THRESHOLD] Control rods stuck - slow drift');
      addLog('🛡️ [THRESHOLD] Boron injection initiated');
    }
    
  if (mitigationActive) {
    newState.boronLevel = Math.min(100, newState.boronLevel + 1.0);
      newState.flow = Math.min(23000, newState.flow + 150);
    }
  }


  if (currentAttack === 'pressure_slow') {
    newState.pressure += 0.15;
    newState.actualTemp += 0.05;
    
    // First: Let threshold detect WITHOUT checking mitigationActive
    if (newState.pressure > 180 && !thresholdDetectionTime) {
      setThresholdDetectionTime(time - attackStartTime);
      addLog(`⚠️ Threshold detected pressure at ${(time - attackStartTime).toFixed(1)}s`);
    }
    
    // Second: Activate mitigation (AI might have already done this)
    if (newState.pressure > 180 && !mitigationActive) {
      setMitigationActive(true);
      setMitigationSystems({
        emergencyCooling: false,
        pressureRelief: true,
        boronInjection: false,
        controlRods: 'scram'
      });
      addLog('🛡️ [THRESHOLD] Pressure relief system activated');
    }
    
    if (mitigationActive) {
      newState.pressure = Math.max(155, newState.pressure - 1.2);
      newState.rodPosition = Math.max(0, newState.rodPosition - 2);
    }
  }

  // ============================================
  // CHALLENGE-RESPONSE: Apply active test to reactor controls
  // ============================================
  if (challengeResponse.active && challengeResponse.currentTest && !mitigationActive) {
    const challenge = challengeResponse.currentTest;
    const elapsedTime = time - challengeResponse.lastTest;
    
    // Only apply challenge during its active duration
    if (elapsedTime < challenge.duration) {
      if (challenge.type === 'rod_pulse') {
        // Temporarily move rods up slightly
        newState.rodPosition = Math.max(0, Math.min(100, 
          challenge.startState.rodPosition + challenge.magnitude
        ));
      }
      
      if (challenge.type === 'flow_step') {
        // Temporarily increase coolant flow
        newState.flow = Math.max(5000, Math.min(28000,
          challenge.startState.flow + challenge.magnitude
        ));
      }
      
      if (challenge.type === 'rod_ramp') {
        // Gradual rod insertion over time
        const progress = elapsedTime / challenge.duration;
        newState.rodPosition = Math.max(0, Math.min(100,
          challenge.startState.rodPosition + (challenge.magnitude * progress)
        ));
      }
    } else {
      // Challenge complete - return to original position
      if (challenge.startState) {
        newState.rodPosition = challenge.startState.rodPosition;
        newState.flow = challenge.startState.flow;
      }
    }
  }

  // Always let physics calculate temp (attacks manipulate inputs, not outputs)
  const tempChange = (newState.power / 200) - (newState.flow / 1000) + (100 - newState.rodPosition) / 10;
  newState.actualTemp = Math.max(250, Math.min(400, newState.actualTemp + tempChange * 0.01));

          if (!['slow_drift', 'replay'].includes(currentAttack)) {
            newState.displayedTemp = newState.actualTemp;
          }

  // Always calculate power from rod position
  const boronEffect = newState.boronLevel / 10;
  // During power_spike attack BEFORE mitigation, skip physics (attack controls power directly)
  // Once mitigation starts, let physics take over so SCRAM can work
  if (currentAttack !== 'power_spike' || mitigationActive) {
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

            // FAST-TRACK DETECTION (before the existing logic)
    if (currentAttack && historicalData.length >= 3) {
      const quickDeviation = calculatePhysicsDeviation(state, physicsTwin);
      const quickAnomaly = calculateAnomalyScore(state, historicalData);
      
      // FAST-TRACK for obvious attacks (detect in 0.5-2s)
      const isSevereAnomaly = quickDeviation.overallScore > 0.6 || quickAnomaly > 0.75
     
      if (isSevereAnomaly && !preliminaryDetectionTime) {
        const detectionTime = time - attackStartTime;
        setPreliminaryDetectionTime(detectionTime);
        setBuildingConfidence(true);
        addLog(`🔍 Preliminary anomaly detected at ${detectionTime.toFixed(1)}s`);
        addLog(`⏳ Building confidence... (0.8s observation required)`);
      }
      
      // Confirm quickly if we have strong evidence
      if (isSevereAnomaly && 
          (time - attackStartTime) >= 2.5 && // Only 0.8s observation
          !aiDetectionTime && 
          !mitigationActive) {
        
        const fusion = fuseDetectionScores({
          physicsDeviation: quickDeviation,
          signalAnalysis: signalAnalysis,
          challengeResponse: challengeResponse,
          statisticalAnomaly: quickAnomaly
        });
        
        const detectionTime = time - attackStartTime;
        setAiDetectionTime(detectionTime);
        setBuildingConfidence(false);
        
        addLog(`🤖 CONFIRMED: ${fusion.attackType || 'ANOMALY'} detected!`);
        addLog(`🤖 Confidence: ${(fusion.confidence * 100).toFixed(0)}% | Fused Score: ${(fusion.fusedScore * 100).toFixed(0)}%`);
        if (fusion.contributingSources && fusion.contributingSources.length > 0) {
          addLog(`🤖 Sources: ${fusion.contributingSources.join(', ')}`);
        }
        addLog(`⚡ Detection time: ${detectionTime.toFixed(1)}s`);
        if (preliminaryDetectionTime) {
          addLog(`   → Preliminary: ${preliminaryDetectionTime.toFixed(1)}s, Confirmed: ${detectionTime.toFixed(1)}s`);
        }
        
        setMitigationActive(true);
        
        // Attack-specific mitigation
        if (fusion.attackType === 'REPLAY_ATTACK' || fusion.attackType === 'SENSOR_SPOOFING') {
          setMitigationSystems({
            emergencyCooling: true,
            pressureRelief: false,
            boronInjection: false,
            controlRods: 'scram'
          });
          addLog('🛡️ Mitigation: Emergency cooling + SCRAM (sensor compromise)');
        } else if (fusion.attackType === 'COORDINATED_ATTACK') {
          setMitigationSystems({
            emergencyCooling: true,
            pressureRelief: true,
            boronInjection: true,
            controlRods: 'fast_scram'
          });
          addLog('🛡️ Mitigation: Full defensive measures (coordinated attack)');
        } else {
          // Default mitigation
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
          } else {
            // Fallback
            setMitigationSystems({
              emergencyCooling: true,
              pressureRelief: false,
              boronInjection: false,
              controlRods: 'scram'
            });
          }
          addLog('🛡️ Mitigation: Emergency systems activated');
        }
      }
    }
        
        setHistoricalData(prev => [...prev.slice(-50), newHistoricalEntry]);
        // Capture data for export
if (currentAttack) {
  const exportEntry = {
    timestamp: time,
    attackType: currentAttack,
    actualTemp: state.actualTemp,
    displayedTemp: state.displayedTemp,
    power: state.power,
    flow: state.flow,
    pressure: state.pressure,
    rodPosition: state.rodPosition,
    boronLevel: state.boronLevel,
    physicsPredictedTemp: physicsTwin.predictedTemp,
    physicsPredictedPower: physicsTwin.predictedPower,
    physicsPredictedPressure: physicsTwin.predictedPressure,
    physicsDeviationOverall: physicsDeviation.overallScore,
    aiAnomalyScore: aiDetectionScore,
    aiFusedScore: fusionAnalysis.fusedScore,
    mitigationActive: mitigationActive,
    status: state.status
  };
  setExportData(prev => [...prev, exportEntry]);
}
        
// Initiate challenge immediately when attack starts OR every 8 seconds
const shouldStartChallenge = currentAttack && 
  !challengeResponse.active && 
  !challengeResponse.currentTest &&
  (time - attackStartTime >= 1.0 && time - attackStartTime < 2.0) || // Start at 1-2s
  (time - challengeResponse.lastTest >= 5); // Or repeat every 5s

if (shouldStartChallenge) {
  // Initiate new challenge
  // Check if this is the first challenge
const isFirstTest = challengeResponse.lastTest === 0;
const newChallenge = executeChallengeResponse(state, physicsTwin, time, isFirstTest);
  if (newChallenge) {
    setChallengeResponse(prev => ({
      ...prev,
      active: true,
      currentTest: newChallenge,
      lastTest: time
    }));
    addLog(`🎯 Challenge initiated: ${newChallenge.description}`);
  }
}

  if (challengeResponse.active && challengeResponse.currentTest) {
    const elapsedTime = time - challengeResponse.lastTest;
    const evaluation = evaluateChallengeResponse(
      challengeResponse.currentTest,
      state,
      challengeResponse.currentTest.startState,
      elapsedTime
    );
    
    if (evaluation.complete) {
      const completedChallenge = challengeResponse.currentTest;
      if (evaluation.spoofDetected) {
        setChallengeResponse(prev => ({
          ...prev,
          active: false,
          currentTest: null,
          testsFailed: prev.testsFailed + 1,
          actualResponse: evaluation,
            expectedTempChange: completedChallenge.expectedTempChange,
  expectedPowerChange: completedChallenge.expectedPowerChange
        }));
        addLog(`🎯 Challenge FAILED: Sensor response anomaly detected!`);
        addLog(`   Expected ΔT: ${completedChallenge.expectedTempChange.toFixed(1)}°C, Actual: ${evaluation.actualTempChange.toFixed(1)}°C`);
      } else {
        setChallengeResponse(prev => ({
          ...prev,
          active: false,
          currentTest: null,
          testsPassed: prev.testsPassed + 1,
          actualResponse: evaluation,
            expectedTempChange: completedChallenge.expectedTempChange,
  expectedPowerChange: completedChallenge.expectedPowerChange
        }));
        addLog(`🎯 Challenge passed: Sensors responding correctly`);
      }
    }
  }
        const deviation = calculatePhysicsDeviation(state, physicsTwin);
        setPhysicsDeviation(deviation);

        if (currentAttack) {
    const newAlerts = generateComparisonAlerts(deviation, state, physicsTwin);
    if (newAlerts.length > 0) {
      setComparisonAlerts(prev => {
        // Keep only last 5 alerts
        const combined = [...prev, ...newAlerts];
        return combined.slice(-5);
      });
    }
  }
        
        if (historicalData.length >= 10) {
          const signals = analyzeSignalPatterns(historicalData);
          setSignalAnalysis(signals);
        }

  if (currentAttack && historicalData.length >= 10) {
    // Calculate individual detection scores
    const anomalyScore = calculateAnomalyScore(state, historicalData);
    setAiDetectionScore(anomalyScore);
    
    // Fuse all detection sources
    const fusion = fuseDetectionScores({
      physicsDeviation,
      signalAnalysis,
      challengeResponse,
      statisticalAnomaly: anomalyScore
    });
    setFusionAnalysis(fusion);
    
    // Detection logic
    const timeElapsed = time - attackStartTime;
    const hasEnoughData = historicalData.length >= 40;
    
    // Dynamic observation window based on attack severity
const getMinimumObservationTime = (fusedScore, attackType) => {
  if (fusedScore > 0.85) return 2;  // Very confident = instant
  if (fusedScore > 0.75) return 3;  // High confidence = fast
  if (fusedScore > 0.65) return 4;  // Medium = moderate
  return 5;  // Lower threshold but still faster
};

    const minimumObservationTime = getMinimumObservationTime(
      fusion.fusedScore, 
      fusion.attackType
    );
    const hasConfidence = timeElapsed >= minimumObservationTime && fusion.confidence >= 0.75;    
    // STEP 1: Preliminary detection (early warning)
    if (fusion.fusedScore > 0.55 && !preliminaryDetectionTime && !buildingConfidence) {
      setPreliminaryDetectionTime(time - attackStartTime);
      setBuildingConfidence(true);
      addLog(`🔍 Preliminary anomaly detected at ${(time - attackStartTime).toFixed(1)}s`);
      addLog(`⏳ Building confidence... (${minimumObservationTime.toFixed(1)}s observation required)`);
    }
    
    // STEP 2: Confirmed detection (after confidence period)
    if (fusion.shouldMitigate && !aiDetectionTime && !mitigationActive && hasEnoughData && hasConfidence) {
      setAiDetectionTime(time - attackStartTime);
      setBuildingConfidence(false);
      addLog(`🤖 CONFIRMED: ${fusion.attackType} detected!`);
      addLog(`🤖 Confidence: ${(fusion.confidence * 100).toFixed(0)}% | Fused Score: ${(fusion.fusedScore * 100).toFixed(0)}%`);
      addLog(`🤖 Sources: ${fusion.contributingSources.join(', ')}`);
      addLog(`⚡ Total detection time: ${(time - attackStartTime).toFixed(1)}s`);
      if (preliminaryDetectionTime) {
        addLog(`   → Preliminary: ${preliminaryDetectionTime.toFixed(1)}s, Confirmed: ${aiDetectionTime.toFixed(1)}s`);
      }
      
      setMitigationActive(true);
      
      // Attack-specific mitigation (keep your existing code here)
      if (fusion.attackType === 'REPLAY_ATTACK' || fusion.attackType === 'SENSOR_SPOOFING') {
        setMitigationSystems({
          emergencyCooling: true,
          pressureRelief: false,
          boronInjection: false,
          controlRods: 'scram'
        });
        addLog('🛡️ Mitigation: Emergency cooling + SCRAM (sensor compromise)');
      } else if (fusion.attackType === 'COORDINATED_ATTACK') {
        setMitigationSystems({
          emergencyCooling: true,
          pressureRelief: true,
          boronInjection: true,
          controlRods: 'fast_scram'
        });
        addLog('🛡️ Mitigation: Full defensive measures (coordinated attack)');
      } else {
        // Default mitigation for unknown/other attacks
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
      }
    }, [time, state, currentAttack, historicalData, aiDetectionTime, attackStartTime, mitigationActive]);
    

    return (
      
      <div className="h-screen bg-gray-950 text-white overflow-hidden">
        
<button
  onClick={props.onBack}
  className="fixed top-20 right-4 z-50 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold shadow-lg flex items-center gap-2 border-2 border-white transition-all"
>
  <ArrowLeftRight className="w-5 h-5" />
  Back to Home
</button>

        {/* FIXED HEADER */}
        <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-cyan-600 z-50 h-16 shadow-xl">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                ⚛️
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  NUCLEAR REACTOR CONTROL SYSTEM
                </h1>
                <p className="text-xs text-cyan-400 font-mono">Digital Twin v4.0 | Physics-Based Detection</p>
              </div>
            </div>

            <div className={`px-8 py-2 rounded-lg font-bold text-lg shadow-lg ${
              state.status === 'safe' ? 'bg-green-600' :
              state.status === 'critical' ? 'bg-red-600 animate-pulse' :
              'bg-yellow-600'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  state.status === 'safe' ? 'bg-green-300' :
                  state.status === 'critical' ? 'bg-red-300 animate-ping' :
                  'bg-yellow-300'
                }`}></div>
                REACTOR: {state.status.toUpperCase()}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-600">
                <div className="text-xs text-gray-400">RUNTIME</div>
                <div className="text-lg font-bold font-mono text-cyan-400">⏱ {time.toFixed(1)}s</div>
              </div>

              {currentAttack && (
                <div className="bg-gradient-to-r from-red-800 to-red-900 px-6 py-2 rounded-lg font-bold animate-pulse shadow-lg border-2 border-red-600">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ATTACK: {currentAttack.toUpperCase().replace('_', ' ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* EMERGENCY COOLING BANNER */}
        {mitigationSystems.emergencyCooling && (
          <div className="fixed top-16 left-0 right-0 bg-blue-600 text-white text-center py-2 font-bold text-lg animate-pulse z-40">
            ❄️ EMERGENCY COOLING SYSTEM ACTIVE
          </div>
        )}

        {/* MAIN DASHBOARD */}
        <main className={`${mitigationSystems.emergencyCooling ? 'pt-28' : 'pt-20'} px-4 pb-4 h-screen bg-gray-950`}>
          <div className="grid grid-cols-12 gap-4 h-full">
            
            {/* LEFT COLUMN - REACTOR VISUALIZATION (4 cols) */}
            <div className="col-span-4 bg-gray-900 rounded-xl border-2 border-gray-700 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
              <h2 className="text-xl font-bold mb-3 text-cyan-400 border-b border-gray-700 pb-2 flex items-center gap-2">
                🔬 REACTOR CORE
              </h2>
              
              <div className="relative bg-gray-900 rounded-lg" style={{ height: '500px' }}>
                {/* Coolant Inlet */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="text-center mb-2 font-bold text-cyan-400 text-sm">COOLANT INLET</div>
                  <div className="w-24 h-16 bg-blue-900 border-4 border-blue-700 rounded-t-lg flex items-center justify-center">
                    <Droplets className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div className="w-8 mx-auto bg-blue-800 border-2 border-blue-600 h-10">
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
                <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-96 rounded-lg border-8 shadow-2xl" 
                    style={{ 
                      height: '320px',
                      background: 'linear-gradient(135deg, #4b5563 0%, #374151 50%, #1f2937 100%)',
                      borderColor: '#52525b',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 2px 4px rgba(255,255,255,0.1)'
                    }}>
                  
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded font-bold text-sm"
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
                            className="absolute w-3 h-3 rounded-full bg-gray-500 border border-gray-700"
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
                    <div className="relative w-[280px] h-[320px]">
                      
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
                      <div className="absolute top-10 left-0 flex justify-center gap-4 w-full">
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
                                className="relative w-7 h-56 rounded-lg shadow-inner transition-all duration-300"
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
                        className="absolute flex justify-center gap-4 w-full transition-all duration-700 z-20"
                        style={{
                          top: `${20 + (state.rodPosition * 2.4)}px`,
                        }}
                      >
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="relative">
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded border-2 border-gray-400"
                                style={{
                                  background: 'linear-gradient(145deg, #9ca3af, #6b7280)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                              <div className="w-1 h-2 bg-gray-600 mx-auto"></div>
                            </div>

                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-500"
                                style={{ height: '12px' }} />

                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gray-500 border-2 border-gray-300 rounded-t"
                                style={{
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
                                }} />
                            
                            <div className="w-7 h-52 rounded-lg border border-gray-700 shadow-2xl relative overflow-hidden"
                                style={{
                                  background: 'linear-gradient(to bottom, #e5e7eb 0%, #9ca3af 30%, #6b7280 60%, #374151 100%)',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,255,255,0.3), inset -1px 0 2px rgba(0,0,0,0.3)'
                                }}>
                              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white to-transparent opacity-50"></div>
                              <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent to-black opacity-30"></div>
                            </div>

                            {(currentAttack === 'rod_stuck_slow') && (
                              <div className="absolute -right-3 -top-2 text-yellow-500 text-xl animate-bounce">⚠️</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Core Temperature Display */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 pointer-events-none">
                        <div className="text-2xl font-bold text-white tracking-widest drop-shadow-lg"
                            style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
                          REACTOR CORE
                        </div>
                        <div className="text-4xl font-extrabold mt-1 drop-shadow-lg" 
                            style={{ 
                              color: coreColor,
                              textShadow: `0 0 20px ${coreColor}, 0 0 40px ${coreColor}88`,
                              animation: state.actualTemp > 350 ? 'pulse 1s infinite' : 'none'
                            }}>
                          {state.actualTemp.toFixed(0)}°C
                        </div>
                        {state.actualTemp > 350 && (
                          <div className="text-red-500 text-sm font-bold mt-1 animate-pulse">⚠️ CRITICAL TEMP ⚠️</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning Labels */}
                  {state.flow > 22000 && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded font-bold animate-pulse z-30 text-sm"
                        style={{
                          background: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
                          boxShadow: '0 4px 6px rgba(37, 99, 235, 0.5), 0 0 20px rgba(37, 99, 235, 0.3)'
                        }}>
                      ⚠️ OVERFLOW!
                    </div>
                  )}

                  {state.flow < 12000 && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded font-bold animate-pulse z-30 text-sm"
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
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 mx-auto bg-orange-800 border-2 border-orange-600 h-10">
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
                  <div className="w-24 h-16 bg-orange-900 border-4 border-orange-700 rounded-b-lg flex items-center justify-center">
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                  <div className="text-center mt-2 font-bold text-orange-400 text-sm">COOLANT OUTLET</div>
                </div>

                {/* Pressure Gauge */}
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-gray-800 p-4 rounded-lg border-2 border-gray-600">
                  <div className="text-center font-bold mb-2 text-sm">PRESSURE</div>
                  <div className="relative w-24 h-24">
                    <Gauge className={`w-24 h-24 ${state.pressure > 180 ? 'text-red-500' : state.pressure > 165 ? 'text-yellow-500' : 'text-green-500'}`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{state.pressure.toFixed(0)}</div>
                        <div className="text-xs">Bar</div>
                      </div>
                    </div>
                  </div>
                  {state.pressure > 180 && (
                    <div className="text-red-500 text-xs font-bold animate-pulse mt-2">CRITICAL!</div>
                  )}
                </div>

                {/* Bottom Stats */}
                <div className="absolute top-1/2 transform -translate-y-1/2 right-25 space-y-2">
                  <div className="bg-gray-800 px-4 py-2 rounded-lg border-2 border-gray-600">
                    <div className="text-xs text-gray-400">COOLANT FLOW</div>
                    <div className="flex items-center gap-2">
                      <Droplets className={`w-5 h-5 ${state.flow < 12000 ? 'text-red-500' : 'text-cyan-400'}`} />
                      <span className={`text-xl font-bold ${state.flow < 12000 ? 'text-red-500' : state.flow > 22000 ? 'text-blue-400' : ''}`}>
                        {state.flow.toFixed(0)}
                      </span>
                      <span className="text-gray-400 text-sm">L/s</span>
                    </div>
                  </div>

                  <div className="bg-gray-800 px-4 py-2 rounded-lg border-2 border-gray-600">
                    <div className="text-xs text-gray-400">CONTROL RODS</div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-400 rounded border border-gray-600" />
                      <span className="text-xl font-bold">{state.rodPosition.toFixed(0)}%</span>
                      <span className="text-xs text-gray-400">
                        {state.rodPosition > 40 ? 'OUT' : state.rodPosition > 10 ? 'IN' : 'FULL'}
                      </span>
                    </div>
                    {(currentAttack === 'rod_stuck_slow') && mitigationActive && (
                      <div className="text-red-400 text-xs font-bold mt-1">⚠️ STUCK</div>
                    )}
                  </div>

                  {mitigationSystems.boronInjection && (
                    <div className="bg-blue-900 px-4 py-2 rounded-lg border-2 border-blue-600">
                      <div className="text-xs text-blue-300">BORON</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-blue-300">{state.boronLevel.toFixed(0)}%</div>
                      </div>
                      <div className="w-full bg-blue-950 rounded-full h-2 mt-1">
                        <div className="bg-blue-400 h-2 rounded-full transition-all" 
                            style={{ width: `${state.boronLevel}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Live Metrics Grid */}
              <div className="bg-gray-800 rounded-xl border-2 border-gray-700 p-4">
                <h3 className="text-xl font-bold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  LIVE METRICS
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Temperature */}
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">CORE TEMPERATURE</div>
                    <div className="text-2xl font-bold" style={{ color: getTempColor(state.actualTemp) }}>
                      {state.actualTemp.toFixed(0)}°C
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="h-2 rounded-full transition-all" 
                          style={{ 
                            width: `${Math.min((state.actualTemp / 500) * 100, 100)}%`,
                            backgroundColor: getTempColor(state.actualTemp)
                          }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Safe: &lt;320°C</div>
                    {(currentAttack === 'slow_drift' || currentAttack === 'replay') && Math.abs(state.displayedTemp - state.actualTemp) > 10 && (
                      <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded text-xs">
                        <div className="font-bold text-red-400">⚠️ SPOOFING</div>
                        <div>Display: {state.displayedTemp.toFixed(0)}°C</div>
                      </div>
                    )}
                  </div>

                  {/* Power */}
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">REACTOR POWER</div>
                    <div className={`text-2xl font-bold ${state.power > 3000 ? 'text-red-500' : 'text-yellow-400'}`}>
                      {state.power.toFixed(0)} MW
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-yellow-400 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((state.power / 5000) * 100, 100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Normal: 1800-2200 MW</div>
                  </div>

                  {/* Flow */}
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">COOLANT FLOW</div>
                    <div className={`text-2xl font-bold ${state.flow < 12000 ? 'text-red-500' : 'text-cyan-400'}`}>
                      {state.flow.toFixed(0)} L/s
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-cyan-400 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min((state.flow / 28000) * 100, 100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Safe: 16000-20000 L/s</div>
                  </div>

                  {/* Pressure */}
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">PRESSURE</div>
                    <div className={`text-2xl font-bold ${state.pressure > 180 ? 'text-red-500' : 'text-green-400'}`}>
                      {state.pressure.toFixed(0)} Bar
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className={`h-2 rounded-full transition-all ${
                        state.pressure > 180 ? 'bg-red-500' : 'bg-green-400'
                      }`} 
                          style={{ width: `${Math.min((state.pressure / 200) * 100, 100)}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Safe: 150-165 Bar</div>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE COLUMN - PHYSICS & DETECTION (5 cols) */}
            <div className="col-span-5 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
              
              {/* Physics Twin Panel */}
              <div className="bg-gradient-to-br from-green-900 to-teal-900 rounded-xl border-2 border-green-600 p-4">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-green-700 pb-2">
                  <Eye className="w-5 h-5 text-green-300" />
                  PHYSICS TWIN
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

                  

  <div className="flex justify-between p-2 bg-green-950 rounded">
    <span className="text-green-300">Neutron Flux:</span>
    <span className="font-bold text-green-200">{physicsTwin.neutronFlux.toFixed(3)}</span>
  </div>

  {physicsTwin.xenonConcentration > 0.001 && (
    <div className="flex justify-between p-2 bg-green-950 rounded">
      <span className="text-green-300">Xenon-135:</span>
      <span className="font-bold text-yellow-400">{physicsTwin.xenonConcentration.toFixed(4)}</span>
    </div>
  )}

  {currentAttack && Math.abs(physicsTwin.predictedTemp - state.actualTemp) > 20 && (
    <div className="mt-2 p-2 bg-red-900 rounded border border-red-600">
      <div className="text-xs font-bold text-red-300">
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

                  {/* Physics Deviation Score */}
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

                  {/* Signal Analysis */}
  {currentAttack && (
    <div className="mt-3 p-2 bg-indigo-900 rounded border border-indigo-600">
      <div className="text-xs font-bold text-indigo-300 mb-2">🔍 SIGNAL ANALYSIS</div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-indigo-200">Variance:</span>
          <span className={`font-bold ${
            signalAnalysis.varianceScore > 0.6 ? 'text-red-400' : 'text-indigo-300'
          }`}>
            {(signalAnalysis.varianceScore * 100).toFixed(0)}%
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-indigo-200">Entropy:</span>
          <span className={`font-bold ${
            signalAnalysis.entropyScore > 0.6 ? 'text-red-400' : 'text-indigo-300'
          }`}>
            {(signalAnalysis.entropyScore * 100).toFixed(0)}%
          </span>
        </div>
        
        {signalAnalysis.spectralScore !== undefined && (
          <div className="flex justify-between">
            <span className="text-indigo-200">Spectral:</span>
            <span className={`font-bold ${
              signalAnalysis.spectralScore > 0.6 ? 'text-red-400' : 'text-indigo-300'
            }`}>
              {(signalAnalysis.spectralScore * 100).toFixed(0)}%
            </span>
          </div>
        )}
        
        {signalAnalysis.periodicity !== undefined && (
          <div className="flex justify-between">
            <span className="text-indigo-200">Periodicity:</span>
            <span className={`font-bold ${
              signalAnalysis.periodicity > 0.8 ? 'text-red-400' : 'text-indigo-300'
            }`}>
              {(signalAnalysis.periodicity * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      
      {(signalAnalysis.varianceScore > 0.5 || signalAnalysis.entropyScore > 0.5) && (
        <div className="text-xs text-red-400 mt-2 p-1 bg-red-950 rounded">
          ⚠️ Anomalous signal patterns detected!
        </div>
      )}
    </div>
  )}

                  {/* Challenge-Response */}
  {currentAttack && (challengeResponse.testsPassed + challengeResponse.testsFailed > 0 || challengeResponse.active) && (
    <div className="mt-3 p-2 bg-purple-900 rounded border border-purple-600">
      <div className="text-xs font-bold text-purple-300 mb-2">🎯 CHALLENGE-RESPONSE</div>
      
      {challengeResponse.active && challengeResponse.currentTest && (
        <div className="mb-2 p-2 bg-purple-950 rounded border border-purple-500 animate-pulse">
          <div className="text-xs text-purple-200">
            ⚡ Active Test: {challengeResponse.currentTest.description}
          </div>
          <div className="text-[10px] text-purple-300 mt-1">
            Duration: {challengeResponse.currentTest.duration}s
          </div>
        </div>
      )}
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-purple-200">Tests Passed:</span>
          <span className="font-bold text-green-400">{challengeResponse.testsPassed}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-purple-200">Tests Failed:</span>
          <span className="font-bold text-red-400">{challengeResponse.testsFailed}</span>
        </div>
      </div>
      
      {challengeResponse.actualResponse && (
        <div className="mt-2 p-1 bg-purple-950 rounded text-[10px]">
          <div className="text-purple-300">Last Test Result:</div>
          <div className="text-purple-200">
          Expected ΔT: {challengeResponse.actualResponse.expectedTempChange?.toFixed(1)}°C
          </div>
          <div className="text-purple-200">
            Actual ΔT: {challengeResponse.actualResponse.actualTempChange?.toFixed(1)}°C
          </div>
          <div className={`font-bold mt-1 ${
            challengeResponse.actualResponse.spoofDetected ? 'text-red-400' : 'text-green-400'
          }`}>
            {challengeResponse.actualResponse.spoofDetected ? '❌ ANOMALY' : '✅ NORMAL'}
          </div>
        </div>
      )}
      
      {challengeResponse.testsFailed > 0 && (
        <div className="text-xs text-red-400 mt-2 p-1 bg-red-950 rounded">
          ⚠️ Sensors not responding correctly to control changes!
        </div>
      )}
    </div>
  )}
                </div>
              </div>

              {/* Comparison Engine Panel */}
  <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl border-2 border-amber-600 p-4">
    <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-amber-700 pb-2">
      <AlertTriangle className="w-5 h-5 text-amber-300" />
      COMPARISON ENGINE
    </h3>

    <div className="space-y-2 text-sm">
      <div className="flex justify-between p-2 bg-amber-950 rounded">
        <span className="text-amber-300">Physics Deviation:</span>
        <span className={`font-bold ${
          physicsDeviation.overallScore > 0.6 ? 'text-red-400' : 
          physicsDeviation.overallScore > 0.3 ? 'text-yellow-400' : 
          'text-green-400'
        }`}>
          {(physicsDeviation.overallScore * 100).toFixed(0)}%
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div className="bg-amber-950 p-1 rounded text-center">
          <div className="text-amber-400">Temp</div>
          <div className="font-bold">{physicsDeviation.tempDev.toFixed(1)}°C</div>
        </div>
        <div className="bg-amber-950 p-1 rounded text-center">
          <div className="text-amber-400">Power</div>
          <div className="font-bold">{physicsDeviation.powerDev.toFixed(0)}MW</div>
        </div>
        <div className="bg-amber-950 p-1 rounded text-center">
          <div className="text-amber-400">Press</div>
          <div className="font-bold">{physicsDeviation.pressureDev.toFixed(0)}Bar</div>
        </div>
      </div>

      {/* Active Alerts */}
      {comparisonAlerts.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-bold text-amber-300">ACTIVE ALERTS:</div>
          {comparisonAlerts.slice(-3).map((alert) => (
            <div key={alert.id} className={`p-2 rounded border text-xs ${
              alert.level === 'CRITICAL' ? 'bg-red-900 border-red-600' :
              alert.level === 'HIGH' ? 'bg-orange-900 border-orange-600' :
              'bg-yellow-900 border-yellow-600'
            }`}>
              <div className="font-bold flex items-center justify-between">
                <span>{alert.level}: {alert.message}</span>
                <span className="text-[10px]">{alert.timestamp}s</span>
              </div>
              <div className="text-[10px] mt-1 opacity-80">{alert.detail}</div>
              <div className="text-[10px] text-gray-300 mt-1">
                Action: {alert.action} | Conf: {(alert.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {currentAttack && comparisonAlerts.length === 0 && (
        <div className="mt-2 p-2 bg-green-900 rounded border border-green-600">
          <div className="text-xs text-green-300">
            ✅ Sensors match physics predictions
          </div>
        </div>
      )}
    </div>
  </div>


              {/* AI Detection System Panel */}
              {currentAttack && (
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl border-2 border-purple-600 p-4">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-purple-700 pb-2">
                    <Brain className="w-5 h-5 text-purple-300" />
                    AI DETECTION SYSTEM
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
      
      {/* Current Time Elapsed */}
      <div className="text-sm text-purple-300">
        ⏱️ Time Elapsed: <span className="font-bold text-white">{(time - attackStartTime).toFixed(1)}s</span>
      </div>

      {/* Preliminary Detection (if triggered) */}
      {preliminaryDetectionTime !== null && (
        <div className="flex items-center gap-2 text-sm bg-yellow-900/50 p-2 rounded">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-yellow-400 font-bold">
            🔍 Preliminary: {preliminaryDetectionTime.toFixed(1)}s
          </span>
        </div>
      )}

      {/* Building Confidence Indicator */}
      {buildingConfidence && aiDetectionTime === null && preliminaryDetectionTime !== null && (
        <div className="p-2 bg-yellow-900/50 rounded border border-yellow-600">
          <div className="text-xs text-yellow-300 mb-1">⏳ Building confidence...</div>
          <div className="w-full bg-yellow-950 rounded-full h-2">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all animate-pulse"
              style={{ 
                width: `${Math.min(((time - attackStartTime - preliminaryDetectionTime) / 1.0) * 100, 100)}%` 
              }}
            />
          </div>
          <div className="text-xs text-yellow-400 mt-1">
            Accumulating evidence...
          </div>
        </div>
      )}

      {/* Confirmed AI Detection */}
      {aiDetectionTime !== null ? (
        <div className="flex items-center gap-2 text-sm bg-green-900/50 p-2 rounded">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-bold">
            🤖 Confirmed: {aiDetectionTime.toFixed(1)}s
          </span>
        </div>
      ) : !buildingConfidence && (
        <div className="flex items-center gap-2 text-sm bg-gray-800 p-2 rounded">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-400">
            🤖 AI: Analyzing...
          </span>
        </div>
      )}
      
      {/* Threshold Detection */}
      {thresholdDetectionTime !== null ? (
        <div className="flex items-center gap-2 text-sm bg-red-900/50 p-2 rounded">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-red-400 font-bold">
            📊 Threshold: {thresholdDetectionTime.toFixed(1)}s
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm bg-gray-800 p-2 rounded">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-gray-400">
            📊 Threshold: Waiting...
          </span>
        </div>
      )}

      {/* Speed Comparison */}
      {aiDetectionTime !== null && thresholdDetectionTime !== null && (
        <div className="mt-2 p-3 bg-green-900 rounded border-2 border-green-600">
          <div className="text-sm font-bold text-green-300 mb-1">
            ⚡ SPEED ADVANTAGE
          </div>
          <div className="text-2xl font-bold text-green-400">
            {(thresholdDetectionTime / aiDetectionTime).toFixed(1)}x FASTER
          </div>
          <div className="text-xs text-green-300 mt-1">
            AI saved {(thresholdDetectionTime - aiDetectionTime).toFixed(1)} seconds
          </div>
          {preliminaryDetectionTime && (
            <div className="text-xs text-green-400 mt-2 p-2 bg-green-950 rounded">
              📊 Detection Breakdown:<br/>
              • Preliminary: {preliminaryDetectionTime.toFixed(1)}s (anomaly noticed)<br/>
              • Confirmed: {aiDetectionTime.toFixed(1)}s (confidence reached)<br/>
              • Observation: {(aiDetectionTime - preliminaryDetectionTime).toFixed(1)}s
            </div>
          )}
        </div>
      )}

      {/* AI Only Detection (for replay attacks) */}
      {aiDetectionTime !== null && thresholdDetectionTime === null && (time - attackStartTime) > 60 && (
        <div className="mt-2 p-3 bg-red-900 rounded border-2 border-red-600">
          <div className="text-sm font-bold text-red-300 mb-1">
            🎯 AI-ONLY DETECTION
          </div>
          <div className="text-xs text-red-400">
            Threshold system failed to detect after {(time - attackStartTime).toFixed(0)}s
          </div>
        </div>
      )}
    </div>
  )}
                  </div>
                </div>
              )}

  {/* AI Fusion Engine Panel */}
  {currentAttack && fusionAnalysis.fusedScore > 0.1 && (
    <div className="bg-gradient-to-br from-violet-900 to-fuchsia-900 rounded-xl border-2 border-violet-600 p-4">
      <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-violet-700 pb-2">
        <Zap className="w-5 h-5 text-violet-300" />
        AI FUSION ENGINE
      </h3>

      <div className="space-y-3">
        {/* Fused Score */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-violet-200">Fused Threat Score</span>
            <span className={`font-bold ${
              fusionAnalysis.fusedScore > 0.65 ? 'text-red-400' : 
              fusionAnalysis.fusedScore > 0.4 ? 'text-yellow-400' : 
              'text-violet-300'
            }`}>
              {(fusionAnalysis.fusedScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-violet-950 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${
              fusionAnalysis.fusedScore > 0.65 ? 'bg-red-500 animate-pulse' : 
              fusionAnalysis.fusedScore > 0.4 ? 'bg-yellow-500' : 
              'bg-violet-400'
            }`} 
                style={{ width: `${Math.min(fusionAnalysis.fusedScore * 100, 100)}%` }} />
          </div>
        </div>

        {/* Confidence */}
        <div className="flex justify-between text-sm p-2 bg-violet-950 rounded">
          <span className="text-violet-300">Detection Confidence:</span>
          <span className="font-bold text-violet-200">
            {(fusionAnalysis.confidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Attack Classification */}
        {fusionAnalysis.attackType !== 'NONE' && (
          <div className="p-3 bg-violet-950 rounded border-2 border-violet-600">
            <div className="text-xs text-violet-400 mb-1">CLASSIFIED THREAT:</div>
            <div className={`text-lg font-bold ${
              fusionAnalysis.attackType === 'COORDINATED_ATTACK' ? 'text-red-400' :
              fusionAnalysis.attackType === 'REPLAY_ATTACK' ? 'text-orange-400' :
              fusionAnalysis.attackType === 'SENSOR_SPOOFING' ? 'text-yellow-400' :
              'text-violet-300'
            }`}>
              {fusionAnalysis.attackType.replace(/_/g, ' ')}
            </div>
          </div>
        )}

        {/* Contributing Sources */}
        {fusionAnalysis.contributingSources.length > 0 && (
          <div className="p-2 bg-violet-950 rounded">
            <div className="text-xs font-bold text-violet-300 mb-2">
              DETECTION SOURCES:
            </div>
            <div className="space-y-1">
              {fusionAnalysis.contributingSources.map((source, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                  <span className="text-violet-200">{source}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        {fusionAnalysis.breakdown && (
          <div className="p-2 bg-violet-950 rounded">
            <div className="text-xs font-bold text-violet-300 mb-2">
              COMPONENT SCORES:
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-16 text-violet-400">Physics:</div>
                <div className="flex-1 bg-violet-900 rounded-full h-2">
                  <div className="bg-violet-400 h-2 rounded-full" 
                      style={{ width: `${fusionAnalysis.breakdown.physics * 100}%` }} />
                </div>
                <div className="w-10 text-right font-mono">
                  {(fusionAnalysis.breakdown.physics * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-16 text-violet-400">Challenge:</div>
                <div className="flex-1 bg-violet-900 rounded-full h-2">
                  <div className="bg-violet-400 h-2 rounded-full" 
                      style={{ width: `${fusionAnalysis.breakdown.challenge * 100}%` }} />
                </div>
                <div className="w-10 text-right font-mono">
                  {(fusionAnalysis.breakdown.challenge * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-16 text-violet-400">Signal:</div>
                <div className="flex-1 bg-violet-900 rounded-full h-2">
                  <div className="bg-violet-400 h-2 rounded-full" 
                      style={{ width: `${fusionAnalysis.breakdown.signal * 100}%` }} />
                </div>
                <div className="w-10 text-right font-mono">
                  {(fusionAnalysis.breakdown.signal * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-16 text-violet-400">ML:</div>
                <div className="flex-1 bg-violet-900 rounded-full h-2">
                  <div className="bg-violet-400 h-2 rounded-full" 
                      style={{ width: `${fusionAnalysis.breakdown.statistical * 100}%` }} />
                </div>
                <div className="w-10 text-right font-mono">
                  {(fusionAnalysis.breakdown.statistical * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mitigation Recommendation */}
        {fusionAnalysis.shouldMitigate && !mitigationActive && (
          <div className="p-2 bg-red-900 rounded border-2 border-red-600 animate-pulse">
            <div className="text-xs font-bold text-red-300">
              🚨 MITIGATION RECOMMENDED
            </div>
          </div>
        )}
      </div>
    </div>
  )}


              {/* Active Mitigation */}
              {mitigationActive && (
                <div className="bg-blue-900 rounded-xl border-2 border-blue-600 p-4">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-blue-700 pb-2">
                    <Shield className="w-5 h-5 text-blue-300" />
                    ACTIVE MITIGATION
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
                      <span className="font-bold">
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

            </div>

            {/* RIGHT COLUMN - CONTROLS & LOGS (3 cols) */}
            <div className="col-span-3 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
              
              {/* Attack Controls */}
              <div className="bg-gray-800 rounded-xl border-2 border-gray-700 p-4">
                <h3 className="text-lg font-bold mb-3 border-b border-gray-700 pb-2">
                  🎯 ATTACK SCENARIOS
                </h3>
                
                <div className="space-y-3">
                  <div className="p-2 bg-blue-900 rounded border border-blue-700">
                    <div className="text-xs font-bold text-blue-300">⚡ FAST ATTACKS</div>
                    <div className="text-xs text-blue-200">Threshold detection works</div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => triggerAttack('loca', 'Loss of Coolant Accident')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      💧 LOCA
                    </button>
                    <button
                      onClick={() => triggerAttack('overflow', 'Coolant Overflow')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      🌊 Overflow
                    </button>
                    <button
                      onClick={() => triggerAttack('power_spike', 'Power Excursion')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      ⚡ Power Spike
                    </button>

                                      <button
                      onClick={() => triggerAttack('rod_stuck_slow', 'Control Rod Stuck')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      🎯 Rod Stuck
                    </button>
                    <button
                      onClick={() => triggerAttack('pressure_slow', 'Slow Pressure Buildup')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-red-700 hover:bg-red-800 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      💥 Pressure
                    </button>

                  </div>

                  <div className="p-2 bg-purple-900 rounded border border-purple-700 mt-3">
                    <div className="text-xs font-bold text-purple-300">🕵️ STEALTH ATTACKS</div>
                    <div className="text-xs text-purple-200">AI catches them 20-30x faster</div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => triggerAttack('slow_drift', 'Slow Temperature Drift')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      🐌 Slow Drift
                    </button>
                    <button
                      onClick={() => triggerAttack('coordinated', 'Coordinated Attack')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      🎭 Coordinated
                    </button>
                    <button
                      onClick={() => triggerAttack('replay', 'Replay Attack')}
                      disabled={currentAttack !== null}
                      className="px-4 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 rounded font-bold transition-colors text-sm"
                    >
                      📼 Replay
                    </button>

                  </div>

                  <button
                    onClick={reset}
                    className="w-full mt-3 px-4 py-3 bg-gray-600 hover:bg-gray-700 rounded font-bold transition-colors"
                  >
                    🔄 RESET SYSTEM
                  </button>
                </div>
              </div>

              {/* Event Log */}
              <div className="bg-gray-800 rounded-xl border-2 border-gray-700 p-4">
                <h3 className="text-lg font-bold mb-3 border-b border-gray-700 pb-2">
                  📋 EVENT LOG
                </h3>
                <div className="space-y-1 font-mono text-xs overflow-y-auto" style={{ maxHeight: '400px' }}>
  {eventLog.map((log, i) => (
    <div key={i} className={`p-2 rounded ${
      log.message.includes('🚨') ? 'bg-red-900 text-red-200' :
      log.message.includes('🛡️') ? 'bg-blue-900 text-blue-200' :
      log.message.includes('🤖') ? 'bg-purple-900 text-purple-200' :
      log.message.includes('⚠️') ? 'bg-yellow-900 text-yellow-200' :
      'bg-gray-700'
    }`}>
      [{log.time.toFixed(1)}s] {log.message}
    </div>
  ))}
                </div>
              </div>
              
              {/* ADD YOUR DATA EXPORT PANEL HERE ↓↓↓ */}
              {/* Data Export Panel */}
              <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-xl border-2 border-emerald-600 p-4">
                <h3 className="text-lg font-bold mb-3 border-b border-emerald-700 pb-2">
                  📊 DATA EXPORT
                </h3>
                
                <div className="space-y-3">
                  {exportData.length > 0 && (
                    <div className="bg-emerald-950 p-3 rounded border border-emerald-700">
                      <div className="text-sm text-emerald-300">Data Points:</div>
                      <div className="text-2xl font-bold text-emerald-200">{exportData.length}</div>
                    </div>
                  )}
                  <button
                    onClick={exportToCSV}
                    disabled={exportData.length === 0}
                    className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded font-bold text-sm"
                  >
                    📄 Export CSV
                  </button>
                  <button
                    onClick={exportSummaryJSON}
                    disabled={!currentAttack}
                    className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 rounded font-bold text-sm"
                  >
                    📋 Export Summary
                  </button>
                </div>
              </div>
              {/* END OF DATA EXPORT PANEL ↑↑↑ */}
              
            </div>
          </div>
          
        </main>

        <style>{`
          @keyframes scan {
            0% { transform: translateY(0); }
            100% { transform: translateY(10px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
            50% { transform: translateY(-20px) translateX(5px); opacity: 0.1; }
          }
          
          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `}</style>
      </div>
    );
  }