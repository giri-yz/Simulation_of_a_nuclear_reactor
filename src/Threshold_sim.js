import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Droplets, Gauge, Shield,ArrowLeftRight } from 'lucide-react';

export default function ThresholdSimulation(props) {
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
  const [thresholdDetectionTime, setThresholdDetectionTime] = useState(null);
  const [attackStartTime, setAttackStartTime] = useState(null);
  const [meltdownProgress, setMeltdownProgress] = useState(0);
  const [structuralDamage, setStructuralDamage] = useState(0);
  const [radiationLevel, setRadiationLevel] = useState(0);
  const [containmentBreach, setContainmentBreach] = useState(false);
  const [exportData, setExportData] = useState([]);

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
    setThresholdDetectionTime(null);
    setAttackStartTime(null);
    setMeltdownProgress(0);
    setStructuralDamage(0);
    setRadiationLevel(0);
    setContainmentBreach(false);
    setExportData([]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 0.1);
      setState(prev => {
        let newState = { ...prev };

        // ATTACK LOGIC
        if (currentAttack === 'loca') {
          newState.flow = Math.max(5000, newState.flow - 200);
          
          if (newState.flow < 12000 && !thresholdDetectionTime) {
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
          
          if (newState.flow > 22000 && !thresholdDetectionTime) {
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
            addLog('🛡️ [THRESHOLD] Pressure relief valves opened');
            addLog('🛡️ [THRESHOLD] Partial control rod insertion');
          }
          
          if (mitigationActive) {
            newState.flow = Math.max(18000, newState.flow - 250);
            newState.rodPosition = Math.max(20, newState.rodPosition - 1);
          }
        }

if (currentAttack === 'power_spike') {
  if (!mitigationActive) {
    newState.power = Math.min(5000, newState.power + 50);
    newState.rodPosition = Math.min(100, newState.rodPosition + 1);
  }
  
  if (newState.power > 3500 && !thresholdDetectionTime) {
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
    addLog('🛡️ [THRESHOLD] Power excursion detected');
    addLog('🛡️ [THRESHOLD] Fast SCRAM - rods fully inserted');
  }
  
  if (mitigationActive) {
    newState.rodPosition = Math.max(0, newState.rodPosition - 4);
    newState.flow = Math.min(24000, newState.flow + 200);
    newState.power = Math.max(500, newState.power - 100);
  }
}

if (currentAttack === 'slow_drift') {
  if (!mitigationActive) {
    newState.rodPosition += 0.04;
  }
  newState.displayedTemp = 285 + Math.sin(time * 0.3) * 5;
  
  // Check temperature threshold
  if (newState.actualTemp > 350 && !thresholdDetectionTime) {
    setThresholdDetectionTime(time - attackStartTime);
    addLog(`⚠️ Threshold detected temperature at ${(time - attackStartTime).toFixed(1)}s`);
  }
  
  // Check power threshold
  if (newState.power > 4500 && !thresholdDetectionTime) {
    setThresholdDetectionTime(time - attackStartTime);
    addLog(`⚠️ Threshold detected power at ${(time - attackStartTime).toFixed(1)}s`);
  }
  
  if ((newState.actualTemp > 350 || newState.power > 4500) && !mitigationActive) {
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
    newState.power = Math.max(500, newState.power - 80);
  }
}

if (currentAttack === 'coordinated') {
  if (!mitigationActive) {
    newState.rodPosition += 0.06;
    newState.flow = Math.max(10000, newState.flow - 25);
  }
  
  // Check temperature threshold
  if (newState.actualTemp > 400 && !thresholdDetectionTime) {
    setThresholdDetectionTime(time - attackStartTime);
    addLog(`⚠️ Threshold detected temperature at ${(time - attackStartTime).toFixed(1)}s`);
  }
  
  // Check flow threshold
  if (newState.flow < 13000 && !thresholdDetectionTime) {
    setThresholdDetectionTime(time - attackStartTime);
    addLog(`⚠️ Threshold detected low flow at ${(time - attackStartTime).toFixed(1)}s`);
  }
  
  // Check power threshold
  if (newState.power > 4500 && !thresholdDetectionTime) {
    setThresholdDetectionTime(time - attackStartTime);
    addLog(`⚠️ Threshold detected power at ${(time - attackStartTime).toFixed(1)}s`);
  }
  
  
  if ((newState.actualTemp > 340 || newState.flow < 13000 || newState.power > 3500) && !mitigationActive) {
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
    newState.power = Math.max(500, newState.power - 100);
  }
}

if (currentAttack === 'replay') {
  if (!mitigationActive) {
    newState.rodPosition += 0.08; // Keep increasing rod withdrawal (damage happens)
  }

  // Spoof BOTH temperature AND power readings to stay under thresholds
  newState.displayedTemp = 285 + Math.sin(time * 0.2) * 3; // Fake safe temp
  
  // NEW: Calculate fake power to show, keeping it under threshold
  const fakePower = 2000 + Math.sin(time * 0.15) * 200; // Oscillate around 2000 MW (safe)
  
  // Check temperature threshold (will NEVER trigger due to spoofing)
  if (newState.actualTemp > 370 && !thresholdDetectionTime) {
    setThresholdDetectionTime(time - attackStartTime);
    addLog(`⚠️ Threshold detected temperature at ${(time - attackStartTime).toFixed(1)}s`);
  }
  
  // REMOVED: Power threshold check - we're spoofing this too!
  // The threshold system should NEVER detect this attack
  
  // Mitigation should NEVER activate for replay attack
  // Remove or comment out the mitigation activation code
  
  // NO MITIGATION - attack proceeds undetected until catastrophic failure
}

        if (currentAttack === 'rod_stuck_slow') {
          if (!mitigationActive) {
            newState.rodPosition = Math.min(75, newState.rodPosition + 0.3);
          }
          
          if (newState.power > 4500 && !thresholdDetectionTime) {
            setThresholdDetectionTime(time - attackStartTime);
            addLog(`⚠️ Threshold detected rod issue at ${(time - attackStartTime).toFixed(1)}s`);
          }
          
          if (newState.power > 4500 && !mitigationActive) {
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
          
          if (newState.pressure > 180 && !thresholdDetectionTime) {
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
            addLog('🛡️ [THRESHOLD] Pressure relief system activated');
          }
          
          if (mitigationActive) {
            newState.pressure = Math.max(155, newState.pressure - 1.2);
            newState.rodPosition = Math.max(0, newState.rodPosition - 2);
          }
        }

        // Physics calculations
        const tempChange = (newState.power / 200) - (newState.flow / 1000) + (100 - newState.rodPosition) / 10;
        newState.actualTemp = Math.max(250, Math.min(400, newState.actualTemp + tempChange * 0.01));

        if (!['slow_drift', 'replay'].includes(currentAttack)) {
          newState.displayedTemp = newState.actualTemp;
        }

        const boronEffect = newState.boronLevel / 10;
        if (currentAttack !== 'power_spike') {
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


if (newState.actualTemp > 350) {
  let meltdownRate = 0;
  if (newState.actualTemp > 350 && newState.actualTemp <= 370) {
    meltdownRate = 0.01; // Much slower - cladding stress (was 0.05)
  } else if (newState.actualTemp > 370 && newState.actualTemp <= 390) {
    meltdownRate = 0.03; // Slower - cladding failure begins (was 0.15)
  } else if (newState.actualTemp > 390 && newState.actualTemp <= 410) {
    meltdownRate = 0.08; // Slower - fuel melting (was 0.4)
  } else if (newState.actualTemp > 410) {
    meltdownRate = 0.15; // Slower - rapid meltdown (was 0.8)
  }
          setMeltdownProgress(prev => Math.min(100, prev + meltdownRate));
          if (meltdownProgress > 20 && meltdownProgress < 21) {
            addLog('💀 FUEL CLADDING FAILURE - Zirconium reacting with water!');
          }
          if (meltdownProgress > 50 && meltdownProgress < 51) {
            addLog('💀 CORE MELTDOWN IN PROGRESS - Fuel pellets melting!');
          }
          if (meltdownProgress > 80 && meltdownProgress < 81) {
            addLog('💀 CORIUM FORMATION - Molten core eating through vessel!');
          }
        }

        // Pressure Vessel Failure
// Pressure Vessel Failure - progressive scaling
if (newState.pressure > 180) {
  let pressureDamageRate = 0;
  if (newState.pressure > 180 && newState.pressure <= 190) {
    pressureDamageRate = 0.02; // Slower (was 0.08)
  } else if (newState.pressure > 190 && newState.pressure <= 205) {
    pressureDamageRate = 0.06; // Slower (was 0.3)
  } else if (newState.pressure > 205 && newState.pressure <= 220) {
    pressureDamageRate = 0.12; // Slower (was 0.7)
  } else if (newState.pressure > 220) {
    pressureDamageRate = 0.3; // Slower (was 2.0)
  }
          setStructuralDamage(prev => Math.min(100, prev + pressureDamageRate));
          if (structuralDamage > 30 && structuralDamage < 31) {
            addLog('⚠️ VESSEL STRESS FRACTURES DETECTED');
          }
          if (structuralDamage > 60 && structuralDamage < 61) {
            addLog('🚨 CRITICAL VESSEL DAMAGE - RUPTURE IMMINENT');
          }
          if (structuralDamage > 90) {
            setContainmentBreach(true);
            addLog('💥 CATASTROPHIC VESSEL RUPTURE!!!');
          }
        }

        // Overpressure from too much flow
// Overpressure from too much flow - scaled
if (newState.flow > 24000) {
  let flowDamageRate = 0;
  if (newState.flow > 24000 && newState.flow <= 26000) {
    flowDamageRate = 0.03; // Slower (was 0.15)
  } else if (newState.flow > 26000) {
    flowDamageRate = 0.08; // Slower (was 0.4)
  }
          setStructuralDamage(prev => Math.min(100, prev + flowDamageRate));
          if (structuralDamage > 40 && structuralDamage < 41) {
            addLog('⚠️ PIPING VIBRATION - Flow rate exceeds design limits!');
          }
        }

        // Power overload
// Power overload - progressive
if (newState.power > 3500) {
  let powerMeltdownRate = 0;
  if (newState.power > 3500 && newState.power <= 4000) {
    powerMeltdownRate = 0.05; // Slower (was 0.3)
  } else if (newState.power > 4000 && newState.power <= 4500) {
    powerMeltdownRate = 0.12; // Slower (was 0.6)
  } else if (newState.power > 4500) {
    powerMeltdownRate = 0.25; // Slower (was 1.2)
            if (Math.random() < 0.02) {
              addLog('💀 POWER EXCURSION - Fuel temperature spiking uncontrollably!');
            }
          }
          setMeltdownProgress(prev => Math.min(100, prev + powerMeltdownRate));
        }

        // Loss of coolant consequences
// Loss of coolant consequences - scaled
if (newState.flow < 12000) {
  let locaMeltdownRate = 0;
  let locaRadiationRate = 0;
  
  if (newState.flow < 12000 && newState.flow >= 10000) {
    locaMeltdownRate = 0.02; // Slower (was 0.1)
    locaRadiationRate = 0.015; // Slower (was 0.08)
  } else if (newState.flow < 10000 && newState.flow >= 8000) {
    locaMeltdownRate = 0.05; // Slower (was 0.25)
    locaRadiationRate = 0.04; // Slower (was 0.2)
  } else if (newState.flow < 8000) {
    locaMeltdownRate = 0.1; // Slower (was 0.5)
    locaRadiationRate = 0.08; // Slower (was 0.4)
  }
          
          setMeltdownProgress(prev => Math.min(100, prev + locaMeltdownRate));
          setRadiationLevel(prev => Math.min(100, prev + locaRadiationRate));
          if (radiationLevel > 50 && radiationLevel < 51) {
            addLog('☢️ SEVERE RADIATION LEAK - Coolant loss exposing fuel!');
          }
        }

        // Steam explosion risk
        if (newState.actualTemp > 370 && newState.flow > 20000) {
          if (Math.random() < 0.02) {
            addLog('💥 STEAM EXPLOSION - Rapid water vaporization!');
            setStructuralDamage(prev => Math.min(100, prev + 10));
          }
        }

// Radiation release based on meltdown stage
if (meltdownProgress > 20 && meltdownProgress <= 40) {
  setRadiationLevel(prev => Math.min(100, prev + 0.03)); // Slower (was 0.15)
} else if (meltdownProgress > 40 && meltdownProgress <= 80) {
  setRadiationLevel(prev => Math.min(100, prev + 0.07)); // Slower (was 0.35)
} else if (meltdownProgress > 80 && meltdownProgress < 100) {
  setRadiationLevel(prev => Math.min(100, prev + 0.12)); // Slower (was 0.6)
}
        // Hydrogen generation from meltdown
if (meltdownProgress > 40) {
  setRadiationLevel(prev => Math.min(100, prev + 0.1)); // Slower (was 0.5)
          if (Math.random() < 0.01) {
            addLog('🔥 HYDROGEN GENERATION - Explosion risk increasing!');
          }
        }

        // Complete meltdown
        if (meltdownProgress >= 100) {
          addLog('💀💀💀 COMPLETE CORE MELTDOWN - CHINA SYNDROME 💀💀💀');
          setContainmentBreach(true);
        }

        // Containment breach radiation
        if (containmentBreach) {
          setRadiationLevel(100);
          addLog('☢️☢️☢️ MASSIVE RADIATION RELEASE TO ENVIRONMENT ☢️☢️☢️');
        }
// Capture data for export
if (currentAttack) {
  const exportEntry = {
    timestamp: time,
    attackType: currentAttack,
    actualTemp: newState.actualTemp,
    displayedTemp: newState.displayedTemp,
    power: newState.power,
    flow: newState.flow,
    pressure: newState.pressure,
    meltdownProgress: meltdownProgress,
    structuralDamage: structuralDamage,
    radiationLevel: radiationLevel,
    containmentBreach: containmentBreach,
    thresholdDetected: thresholdDetectionTime !== null,
    mitigationActive: mitigationActive,
    status: newState.status
  };
  setExportData(prev => [...prev, exportEntry]);
}

return newState;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentAttack, mitigationActive, time, attackStartTime, thresholdDetectionTime, meltdownProgress, structuralDamage, radiationLevel, containmentBreach]);
const exportToCSV = () => {
  if (exportData.length === 0) {
    alert('No data to export. Run an attack first!');
    return;
  }

  const headers = [
    'Timestamp',
    'Attack_Type',
    'Actual_Temp',
    'Displayed_Temp',
    'Power',
    'Flow',
    'Pressure',
    'Meltdown_Progress',
    'Structural_Damage',
    'Radiation_Level',
    'Containment_Breach',
    'Threshold_Detected',
    'Mitigation_Active',
    'Status'
  ].join(',');

  const rows = exportData.map(row => [
    row.timestamp.toFixed(2),
    row.attackType || 'none',
    row.actualTemp.toFixed(2),
    row.displayedTemp.toFixed(2),
    row.power.toFixed(2),
    row.flow.toFixed(2),
    row.pressure.toFixed(2),
    row.meltdownProgress.toFixed(2),
    row.structuralDamage.toFixed(2),
    row.radiationLevel.toFixed(2),
    row.containmentBreach ? 1 : 0,
    row.thresholdDetected ? 1 : 0,
    row.mitigationActive ? 1 : 0,
    row.status
  ].join(','));

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `threshold_system_${currentAttack}_${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const exportSummaryJSON = () => {
  if (!currentAttack) {
    alert('No attack data. Run an attack first!');
    return;
  }

  const summary = {
    attack_type: currentAttack,
    detection_time: thresholdDetectionTime,
    final_consequences: {
      meltdown_progress: meltdownProgress,
      structural_damage: structuralDamage,
      radiation_level: radiationLevel,
      containment_breach: containmentBreach
    },
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
  a.download = `threshold_summary_${currentAttack}_${Date.now()}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
};


return (
  <div className="h-screen bg-gray-950 text-white overflow-hidden">

        <button
      onClick={props.onBack}
      className="fixed top-20 right-4 z-[60] px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold shadow-lg flex items-center gap-2 border-2 border-white transition-all"
    >
      <ArrowLeftRight className="w-5 h-5" />
      Back to Home
    </button>
      {/* CATASTROPHIC WARNINGS */}
      {containmentBreach && (
        <div className="fixed inset-0 bg-red-900/80 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-none">
          <div className="text-center animate-pulse">
            <div className="text-9xl mb-4">☢️</div>
            <div className="text-6xl font-bold text-white mb-4">CONTAINMENT BREACH</div>
            <div className="text-3xl text-red-200">CATASTROPHIC FAILURE</div>
            <div className="text-xl text-red-300 mt-4">Environmental Radiation Release</div>
          </div>
        </div>
      )}

      {meltdownProgress > 80 && !containmentBreach && (
        <div className="fixed top-24 left-0 right-0 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white text-center py-3 font-bold text-xl animate-pulse z-50 border-y-4 border-yellow-400">
          💀 CORE MELTDOWN IN PROGRESS: {meltdownProgress.toFixed(0)}% 💀
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-orange-600 z-50 h-16 shadow-xl">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-2xl shadow-lg">
              ⚛️
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                NUCLEAR REACTOR CONTROL SYSTEM
              </h1>
              <p className="text-xs text-orange-400 font-mono">Legacy System | Threshold-Based Detection</p>
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
              <div className="text-lg font-bold font-mono text-orange-400">⏱ {time.toFixed(1)}s</div>
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

      {mitigationSystems.emergencyCooling && (
        <div className="fixed top-16 left-0 right-0 bg-blue-600 text-white text-center py-2 font-bold text-lg animate-pulse z-40">
          ❄️ EMERGENCY COOLING SYSTEM ACTIVE
        </div>
      )}

      <main className={`${mitigationSystems.emergencyCooling ? 'pt-28' : 'pt-20'} px-4 pb-4 h-screen bg-gray-950`}>
        
        <div className="grid grid-cols-12 gap-4 h-full">
          
          
          {/* LEFT - REACTOR CORE */}
          <div className="col-span-4 relative bg-gray-900 rounded-lg h-[calc(100%-3rem)]">
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

              {/* Structural damage cracks */}
              {structuralDamage > 40 && (
                <div className="absolute inset-0 pointer-events-none z-45">
                  {[...Array(Math.floor(structuralDamage / 15))].map((_, i) => (
                    <div key={i}
                         className="absolute bg-black"
                         style={{
                           width: '3px',
                           height: `${50 + Math.random() * 100}px`,
                           left: `${Math.random() * 100}%`,
                           top: `${Math.random() * 100}%`,
                           transform: `rotate(${Math.random() * 360}deg)`,
                           opacity: 0.6
                         }} />
                  ))}
                </div>
              )}
            </div>

            {/* Coolant Outlet */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
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
            <div className="absolute bottom-8 left-8 space-y-2">
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

          {/* MIDDLE - THRESHOLD DETECTION INFO */}
          <div className="col-span-5 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
            
            {/* CONSEQUENCES PANEL */}
            <div className="bg-gradient-to-br from-red-900 to-black rounded-xl border-2 border-red-600 p-4">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-red-700 pb-2">
                💀 REAL-TIME CONSEQUENCES
              </h3>

              <div className="space-y-3">
                {/* Meltdown Progress */}
                <div className="bg-red-950 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-red-300">CORE MELTDOWN</span>
                    <span className={`text-lg font-bold ${meltdownProgress > 50 ? 'text-red-400 animate-pulse' : 'text-red-500'}`}>
                      {meltdownProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-4 transition-all duration-500"
                      style={{ 
                        width: `${meltdownProgress}%`,
                        background: meltdownProgress > 80 ? 'linear-gradient(to right, #dc2626, #f97316, #dc2626)' : 
                                   meltdownProgress > 40 ? 'linear-gradient(to right, #dc2626, #ef4444)' : '#dc2626'
                      }} />
                  </div>
                  <div className="text-xs text-red-300 mt-2">
                    {meltdownProgress === 0 && '✓ Core stable'}
                    {meltdownProgress > 0 && meltdownProgress < 30 && '⚠️ Fuel cladding degradation'}
                    {meltdownProgress >= 30 && meltdownProgress < 60 && '💀 Fuel melting initiated'}
                    {meltdownProgress >= 60 && meltdownProgress < 90 && '💀 Corium formation - eating through vessel'}
                    {meltdownProgress >= 90 && meltdownProgress < 100 && '💀 IMMINENT VESSEL BREACH'}
                    {meltdownProgress >= 100 && '💀💀💀 COMPLETE MELTDOWN 💀💀💀'}
                  </div>
                </div>

                {/* Structural Damage */}
                <div className="bg-orange-950 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-orange-300">STRUCTURAL INTEGRITY</span>
                    <span className={`text-lg font-bold ${structuralDamage > 70 ? 'text-red-400 animate-pulse' : 'text-orange-400'}`}>
                      {(100 - structuralDamage).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                      style={{ width: `${100 - structuralDamage}%` }} />
                  </div>
                  <div className="text-xs text-orange-300 mt-2">
                    {structuralDamage === 0 && '✓ Vessel intact'}
                    {structuralDamage > 0 && structuralDamage < 40 && '⚠️ Minor stress fractures'}
                    {structuralDamage >= 40 && structuralDamage < 70 && '🚨 Severe structural damage'}
                    {structuralDamage >= 70 && structuralDamage < 95 && '💥 CRITICAL - Rupture imminent'}
                    {structuralDamage >= 95 && '💥💥💥 CATASTROPHIC FAILURE 💥💥💥'}
                  </div>
                </div>

                {/* Radiation Level */}
                <div className="bg-green-950 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-green-300">RADIATION LEVEL</span>
                    <span className={`text-lg font-bold ${radiationLevel > 60 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                      {radiationLevel.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-4 transition-all duration-500"
                      style={{ 
                        width: `${radiationLevel}%`,
                        background: radiationLevel > 80 ? 'linear-gradient(to right, #22c55e, #eab308, #ef4444)' : 
                                   radiationLevel > 40 ? 'linear-gradient(to right, #22c55e, #eab308)' : '#22c55e'
                      }} />
                  </div>
                  <div className="text-xs text-green-300 mt-2">
                    {radiationLevel === 0 && '✓ Normal background levels'}
                    {radiationLevel > 0 && radiationLevel < 30 && '⚠️ Elevated readings detected'}
                    {radiationLevel >= 30 && radiationLevel < 60 && '☢️ Dangerous - Evacuation recommended'}
                    {radiationLevel >= 60 && radiationLevel < 90 && '☢️ SEVERE - Life threatening exposure'}
                    {radiationLevel >= 90 && '☢️☢️☢️ LETHAL RADIATION ☢️☢️☢️'}
                  </div>
                </div>

                {containmentBreach && (
                  <div className="bg-red-900 border-4 border-red-500 rounded p-4 animate-pulse">
                    <div className="text-center">
                      <div className="text-4xl mb-2">☢️</div>
                      <div className="text-lg font-bold text-red-200">CONTAINMENT BREACH</div>
                      <div className="text-sm text-red-300 mt-2">Environmental contamination</div>
                      <div className="text-sm text-red-300">Immediate evacuation required</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Threshold Detection Panel */}
            <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-xl border-2 border-orange-600 p-4">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2 border-b border-orange-700 pb-2">
                <AlertTriangle className="w-5 h-5 text-orange-300" />
                THRESHOLD DETECTION SYSTEM
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-orange-950 rounded">
                  <div className="text-xs text-orange-400 mb-2">DETECTION RULES:</div>
                  <div className="space-y-1 text-xs text-orange-200">
                    <div>• Temp &gt; 350°C → SCRAM</div>
                    <div>• Flow &lt; 12000 L/s → Emergency Cooling</div>
                    <div>• Flow &gt; 22000 L/s → Pressure Relief</div>
                    <div>• Power &gt; 3500 MW → Fast SCRAM</div>
                    <div>• Pressure &gt; 180 Bar → Relief Valves</div>
                  </div>
                </div>

                {attackStartTime !== null && (
                  <div className="bg-orange-950 rounded p-3 space-y-2">
                    <div className="text-sm font-bold text-orange-200">Detection Timeline:</div>
                    
                    <div className="text-sm text-orange-300">
                      ⏱️ Time Elapsed: <span className="font-bold text-white">{(time - attackStartTime).toFixed(1)}s</span>
                    </div>

                    {thresholdDetectionTime !== null ? (
                      <div className="flex items-center gap-2 text-sm bg-red-900/50 p-2 rounded">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-red-400 font-bold">
                          📊 Detected: {thresholdDetectionTime.toFixed(1)}s
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm bg-gray-800 p-2 rounded">
                        <div className="w-3 h-3 bg-gray-500 rounded-full animate-pulse"></div>
                        <span className="text-gray-400">
                          📊 Monitoring thresholds...
                        </span>
                      </div>
                    )}

                    {thresholdDetectionTime === null && (time - attackStartTime) > 30 && (
                      <div className="mt-2 p-3 bg-red-900 rounded border-2 border-red-600 animate-pulse">
                        <div className="text-sm font-bold text-red-300 mb-1">
                          ⚠️ NO DETECTION
                        </div>
                        <div className="text-xs text-red-400">
                          Threshold system unable to detect subtle attack after {(time - attackStartTime).toFixed(0)}s
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 bg-red-900 rounded border border-red-600">
                  <div className="text-xs font-bold text-red-300 mb-2">⚠️ LIMITATIONS:</div>
                  <div className="text-xs text-red-200 space-y-1">
                    <div>• No physics validation</div>
                    <div>• Cannot detect sensor spoofing</div>
                    <div>• Blind to replay attacks</div>
                    <div>• Slow response to gradual attacks</div>
                    <div>• No predictive capabilities</div>
                  </div>
                </div>
              </div>
            </div>

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
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
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

            {/* Live Metrics */}
            <div className="bg-gray-800 rounded-xl border-2 border-gray-700 p-4">
              <h3 className="text-xl font-bold mb-3 border-b border-gray-700 pb-2 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                LIVE METRICS
              </h3>
              <div className="grid grid-cols-2 gap-3">
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
                  {(currentAttack === 'slow_drift' || currentAttack === 'replay') && Math.abs(state.displayedTemp - state.actualTemp) > 10 && (
                    <div className="mt-2 p-2 bg-red-900 border border-red-600 rounded text-xs">
                      <div className="font-bold text-red-400">⚠️ SPOOFED!</div>
                      <div>Display: {state.displayedTemp.toFixed(0)}°C</div>
                      <div className="text-[10px] text-red-300 mt-1">Threshold system cannot detect this!</div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">REACTOR POWER</div>
                  <div className={`text-2xl font-bold ${state.power > 3000 ? 'text-red-500' : 'text-yellow-400'}`}>
                    {state.power.toFixed(0)} MW
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-yellow-400 h-2 rounded-full transition-all" 
                         style={{ width: `${Math.min((state.power / 5000) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">COOLANT FLOW</div>
                  <div className={`text-2xl font-bold ${state.flow < 12000 ? 'text-red-500' : 'text-cyan-400'}`}>
                    {state.flow.toFixed(0)} L/s
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-cyan-400 h-2 rounded-full transition-all" 
                         style={{ width: `${Math.min((state.flow / 28000) * 100, 100)}%` }} />
                  </div>
                </div>

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
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - CONTROLS & LOGS */}
          <div className="col-span-3 space-y-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 7rem)' }}>
            
            {/* Attack Controls */}
            <div className="bg-gray-800 rounded-xl border-2 border-gray-700 p-4">
              <h3 className="text-lg font-bold mb-3 border-b border-gray-700 pb-2">
                🎯 ATTACK SCENARIOS
              </h3>
              
              <div className="space-y-3">
                <div className="p-2 bg-blue-900 rounded border border-blue-700">
                  <div className="text-xs font-bold text-blue-300">⚡ FAST ATTACKS</div>
                  <div className="text-xs text-blue-200">Threshold can detect these</div>
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

                <div className="p-2 bg-red-900 rounded border border-red-700 mt-3">
                  <div className="text-xs font-bold text-red-300">🕵️ STEALTH ATTACKS</div>
                  <div className="text-xs text-red-200">Threshold struggles with these!</div>
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
                    log.message.includes('⚠️') ? 'bg-yellow-900 text-yellow-200' :
                    'bg-gray-700'
                  }`}>
                    [{log.time.toFixed(1)}s] {log.message}
                  </div>
                ))}
              </div>
            </div>

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

          </div>
        </div>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes float {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        
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