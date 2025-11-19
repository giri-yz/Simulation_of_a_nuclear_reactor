import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Upload, AlertTriangle,ArrowLeftRight, TrendingUp, Activity, Brain, Shield, DollarSign, Clock, Zap, Users, FileText, AlertCircle, TrendingDown, Package, Globe } from 'lucide-react';

export default function AdvancedReactorAnalysis(props) {
  const [aiData, setAiData] = useState(null);
  const [thresholdData, setThresholdData] = useState(null);
  const [aiFileName, setAiFileName] = useState('');
  const [thresholdFileName, setThresholdFileName] = useState('');
  const [activeTab, setActiveTab] = useState('business');

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        const value = values[i];
        obj[header.trim()] = isNaN(value) ? value : parseFloat(value);
      });
      return obj;
    });

    if (type === 'ai') {
      setAiData(rows);
      setAiFileName(file.name);
    } else {
      setThresholdData(rows);
      setThresholdFileName(file.name);
    }
  };

  const calculateEnhancedBusinessImpact = (data, detectionTime, systemType) => {
    if (!data || data.length === 0) return null;

    const lastPoint = data[data.length - 1];
    const maxTemp = Math.max(...data.map(d => d.Actual_Temp || d.actualTemp));
    const maxPressure = Math.max(...data.map(d => d.Pressure || d.pressure));
    
    const meltdownProgress = lastPoint.Meltdown_Progress || lastPoint.meltdownProgress || 0;
    const structuralDamage = lastPoint.Structural_Damage || lastPoint.structuralDamage || 0;
    const radiationLevel = lastPoint.Radiation_Level || lastPoint.radiationLevel || 0;
    const containmentBreach = lastPoint.Containment_Breach || lastPoint.containmentBreach || false;

    // Industry-standard cost models (in millions USD)
    let directCosts = {
      equipmentReplacement: 0,
      structuralRepair: 0,
      fuelReplacement: 0,
      decontamination: 0,
      emergencyResponse: 5, // Base cost for incident response team
      inspection: 2
    };

    let indirectCosts = {
      lostRevenue: 0,
      replacementPower: 0,
      staffing: 0,
      legalFees: 0,
      publicRelations: 0,
      communityCompensation: 0
    };

    let regulatoryCosts = {
      nrcFines: 0,
      stateAgencyFines: 0,
      epaFines: 0,
      complianceAudits: 0,
      mandatedUpgrades: 0
    };

    let insuranceLiability = {
      propertyDamage: 0,
      liabilityPayout: 0,
      premiumIncrease: 0, // Annual increase for next 5 years
      deductible: 10
    };

    let longTermCosts = {
      healthMonitoring: 0,
      environmentalRemediation: 0,
      reducedCapacity: 0,
      reputationalDamage: 0,
      supplierPenalties: 0
    };

    const dailyRevenue = 2.5; // $2.5M per day at 1000MW
    const replacementPowerCost = 1.8; // $1.8M per day for replacement power
    let downtime = 0;

    // Temperature damage assessment
    if (maxTemp > 350) {
      const tempExcess = maxTemp - 350;
      directCosts.equipmentReplacement += tempExcess * 0.8;
      downtime += Math.floor(tempExcess / 3);
      
      if (maxTemp > 400) {
        directCosts.structuralRepair += (maxTemp - 400) * 1.2;
        regulatoryCosts.mandatedUpgrades += 15;
      }
    }

    // Meltdown progression costs (based on INAG scale)
    if (meltdownProgress > 0) {
      if (meltdownProgress < 10) {
        // Minor fuel damage
        directCosts.fuelReplacement += 35;
        directCosts.equipmentReplacement += 25;
        downtime += 45;
        regulatoryCosts.nrcFines += 5;
        regulatoryCosts.complianceAudits += 2;
        longTermCosts.healthMonitoring += 3;
      } else if (meltdownProgress < 25) {
        // Moderate fuel damage
        directCosts.fuelReplacement += 120;
        directCosts.equipmentReplacement += 80;
        directCosts.decontamination += 50;
        downtime += 120;
        regulatoryCosts.nrcFines += 25;
        regulatoryCosts.stateAgencyFines += 10;
        regulatoryCosts.complianceAudits += 5;
        indirectCosts.legalFees += 15;
        longTermCosts.healthMonitoring += 15;
        longTermCosts.reputationalDamage += 20;
      } else if (meltdownProgress < 50) {
        // Significant core damage
        directCosts.fuelReplacement += 350;
        directCosts.equipmentReplacement += 250;
        directCosts.decontamination += 200;
        directCosts.structuralRepair += 150;
        downtime += 270;
        regulatoryCosts.nrcFines += 100;
        regulatoryCosts.stateAgencyFines += 40;
        regulatoryCosts.epaFines += 30;
        regulatoryCosts.mandatedUpgrades += 80;
        indirectCosts.legalFees += 50;
        indirectCosts.publicRelations += 25;
        indirectCosts.communityCompensation += 40;
        insuranceLiability.propertyDamage += 200;
        insuranceLiability.premiumIncrease += 5;
        longTermCosts.healthMonitoring += 50;
        longTermCosts.environmentalRemediation += 75;
        longTermCosts.reputationalDamage += 100;
      } else if (meltdownProgress < 75) {
        // Severe meltdown
        directCosts.fuelReplacement += 800;
        directCosts.equipmentReplacement += 600;
        directCosts.decontamination += 500;
        directCosts.structuralRepair += 400;
        downtime += 540;
        regulatoryCosts.nrcFines += 300;
        regulatoryCosts.stateAgencyFines += 120;
        regulatoryCosts.epaFines += 80;
        regulatoryCosts.mandatedUpgrades += 200;
        indirectCosts.legalFees += 150;
        indirectCosts.publicRelations += 75;
        indirectCosts.communityCompensation += 200;
        insuranceLiability.propertyDamage += 600;
        insuranceLiability.liabilityPayout += 300;
        insuranceLiability.premiumIncrease += 15;
        longTermCosts.healthMonitoring += 150;
        longTermCosts.environmentalRemediation += 250;
        longTermCosts.reputationalDamage += 400;
        longTermCosts.supplierPenalties += 50;
      } else {
        // Catastrophic meltdown
        directCosts.fuelReplacement += 2000;
        directCosts.equipmentReplacement += 1500;
        directCosts.decontamination += 1500;
        directCosts.structuralRepair += 1000;
        downtime += 1825; // 5 years minimum
        regulatoryCosts.nrcFines += 1000;
        regulatoryCosts.stateAgencyFines += 400;
        regulatoryCosts.epaFines += 300;
        regulatoryCosts.mandatedUpgrades += 500;
        indirectCosts.legalFees += 500;
        indirectCosts.publicRelations += 200;
        indirectCosts.communityCompensation += 800;
        insuranceLiability.propertyDamage += 2000;
        insuranceLiability.liabilityPayout += 1500;
        insuranceLiability.premiumIncrease += 40;
        longTermCosts.healthMonitoring += 500;
        longTermCosts.environmentalRemediation += 1000;
        longTermCosts.reputationalDamage += 1500;
        longTermCosts.reducedCapacity += 300;
        longTermCosts.supplierPenalties += 200;
      }
    }

    // Structural damage costs
    if (structuralDamage > 20) {
      directCosts.structuralRepair += structuralDamage * 8;
      downtime += Math.floor(structuralDamage / 1.5);
      regulatoryCosts.mandatedUpgrades += structuralDamage * 2;
      
      if (structuralDamage > 50) {
        insuranceLiability.propertyDamage += structuralDamage * 10;
        longTermCosts.reducedCapacity += structuralDamage * 3;
      }
    }

    // Radiation release costs
    if (radiationLevel > 20) {
      directCosts.decontamination += radiationLevel * 3;
      regulatoryCosts.epaFines += radiationLevel * 2;
      indirectCosts.communityCompensation += radiationLevel * 5;
      longTermCosts.healthMonitoring += radiationLevel * 4;
      longTermCosts.environmentalRemediation += radiationLevel * 6;
      
      if (radiationLevel > 40) {
        indirectCosts.publicRelations += radiationLevel * 2;
        longTermCosts.reputationalDamage += radiationLevel * 8;
      }
      
      if (radiationLevel > 60) {
        indirectCosts.communityCompensation += 500;
        longTermCosts.healthMonitoring += 300;
      }
    }

    // Containment breach - catastrophic scenario
    if (containmentBreach) {
      directCosts.structuralRepair += 3000;
      directCosts.decontamination += 4000;
      downtime = 7300; // 20 years - likely permanent closure
      regulatoryCosts.nrcFines += 2000;
      regulatoryCosts.epaFines += 1000;
      indirectCosts.legalFees += 1000;
      indirectCosts.communityCompensation += 3000;
      insuranceLiability.propertyDamage += 5000;
      insuranceLiability.liabilityPayout += 5000;
      longTermCosts.healthMonitoring += 2000;
      longTermCosts.environmentalRemediation += 5000;
      longTermCosts.reputationalDamage += 3000;
    }

    // Calculate indirect operational costs
    indirectCosts.lostRevenue = downtime * dailyRevenue;
    indirectCosts.replacementPower = downtime * replacementPowerCost;
    indirectCosts.staffing = downtime * 0.15; // Maintaining staff during shutdown
    
    // Total direct costs
    const totalDirectCosts = Object.values(directCosts).reduce((a, b) => a + b, 0);
    const totalRegulatoryCompliance = Object.values(regulatoryCosts).reduce((a, b) => a + b, 0);
    const totalIndirectCosts = Object.values(indirectCosts).reduce((a, b) => a + b, 0);
    const totalInsuranceLiability = Object.values(insuranceLiability).reduce((a, b) => a + b, 0);
    const totalLongTermCosts = Object.values(longTermCosts).reduce((a, b) => a + b, 0);
    
    const totalCost = totalDirectCosts + totalRegulatoryCompliance + totalIndirectCosts + 
                      totalInsuranceLiability + totalLongTermCosts;

    // Cost per minute of detection delay
    const costPerMinute = detectionTime > 0 ? (totalCost / (detectionTime / 60)) : 0;

    // Risk severity score (0-100)
    const riskScore = Math.min(100, 
      (meltdownProgress * 0.4) + 
      (structuralDamage * 0.3) + 
      (radiationLevel * 0.2) + 
      ((maxTemp - 290) / 110 * 10)
    );

    // Recovery phases with detailed breakdown
    let recoveryPhases = [];
    if (downtime > 0) {
      if (downtime < 90) {
        recoveryPhases = [
          { phase: 'Safety Assessment', days: Math.floor(downtime * 0.15), cost: directCosts.inspection },
          { phase: 'Equipment Repair', days: Math.floor(downtime * 0.45), cost: directCosts.equipmentReplacement },
          { phase: 'System Testing', days: Math.floor(downtime * 0.25), cost: directCosts.inspection * 1.5 },
          { phase: 'NRC Approval', days: Math.floor(downtime * 0.15), cost: regulatoryCosts.complianceAudits }
        ];
      } else if (downtime < 365) {
        recoveryPhases = [
          { phase: 'Damage Assessment', days: Math.floor(downtime * 0.12), cost: directCosts.inspection * 2 },
          { phase: 'Decontamination', days: Math.floor(downtime * 0.2), cost: directCosts.decontamination },
          { phase: 'Major Repairs', days: Math.floor(downtime * 0.35), cost: directCosts.equipmentReplacement + directCosts.structuralRepair },
          { phase: 'Systems Integration', days: Math.floor(downtime * 0.18), cost: 30 },
          { phase: 'Testing & Certification', days: Math.floor(downtime * 0.15), cost: regulatoryCosts.complianceAudits * 2 }
        ];
      } else {
        recoveryPhases = [
          { phase: 'Full Site Assessment', days: Math.floor(downtime * 0.08), cost: 50 },
          { phase: 'Decontamination', days: Math.floor(downtime * 0.22), cost: directCosts.decontamination },
          { phase: 'Core Replacement', days: Math.floor(downtime * 0.25), cost: directCosts.fuelReplacement },
          { phase: 'Structural Rebuild', days: Math.floor(downtime * 0.25), cost: directCosts.structuralRepair },
          { phase: 'Systems Overhaul', days: Math.floor(downtime * 0.12), cost: directCosts.equipmentReplacement },
          { phase: 'Full Testing & Certification', days: Math.floor(downtime * 0.08), cost: regulatoryCosts.complianceAudits * 3 }
        ];
      }
    }

    return {
      directCosts,
      indirectCosts,
      regulatoryCosts,
      insuranceLiability,
      longTermCosts,
      totalDirectCosts,
      totalIndirectCosts,
      totalRegulatoryCompliance,
      totalInsuranceLiability,
      totalLongTermCosts,
      totalCost,
      downtime,
      recoveryPhases,
      meltdownProgress,
      structuralDamage,
      radiationLevel,
      containmentBreach,
      detectionTime,
      costPerMinute,
      riskScore,
      maxTemp,
      maxPressure
    };
  };

  const getComparisonStats = () => {
    if (!aiData || !thresholdData) return null;

    const aiDetectionTime = aiData.find(d => d.Mitigation_Active === 1)?.Timestamp || null;
    const thresholdDetectionTime = thresholdData.find(d => d.Threshold_Detected === 1 || d.thresholdDetected === 1)?.Timestamp || 
                                   thresholdData.find(d => d.Mitigation_Active === 1 || d.mitigationActive === 1)?.Timestamp || null;

    const aiImpact = calculateEnhancedBusinessImpact(aiData, aiDetectionTime, 'AI');
    const thresholdImpact = calculateEnhancedBusinessImpact(thresholdData, thresholdDetectionTime, 'Threshold');

    if (!aiImpact || !thresholdImpact) return null;

    const costSavings = thresholdImpact.totalCost - aiImpact.totalCost;
    const downtimeSavings = thresholdImpact.downtime - aiImpact.downtime;
    const timeAdvantage = thresholdDetectionTime && aiDetectionTime 
      ? thresholdDetectionTime - aiDetectionTime
      : 0;

    return {
      aiImpact,
      thresholdImpact,
      costSavings,
      downtimeSavings,
      timeAdvantage,
      aiDetectionTime,
      thresholdDetectionTime
    };
  };

  const stats = getComparisonStats();

  const renderBusinessImpact = () => {
    if (!stats) return null;

    const costComparisonData = [
      { category: 'Direct Costs', AI: stats.aiImpact.totalDirectCosts, Threshold: stats.thresholdImpact.totalDirectCosts },
      { category: 'Lost Revenue', AI: stats.aiImpact.indirectCosts.lostRevenue, Threshold: stats.thresholdImpact.indirectCosts.lostRevenue },
      { category: 'Regulatory', AI: stats.aiImpact.totalRegulatoryCompliance, Threshold: stats.thresholdImpact.totalRegulatoryCompliance },
      { category: 'Insurance', AI: stats.aiImpact.totalInsuranceLiability, Threshold: stats.thresholdImpact.totalInsuranceLiability },
      { category: 'Long-term', AI: stats.aiImpact.totalLongTermCosts, Threshold: stats.thresholdImpact.totalLongTermCosts }
    ];

    const aiBreakdown = [
      { name: 'Direct', value: stats.aiImpact.totalDirectCosts, color: '#8b5cf6' },
      { name: 'Indirect', value: stats.aiImpact.totalIndirectCosts, color: '#ec4899' },
      { name: 'Regulatory', value: stats.aiImpact.totalRegulatoryCompliance, color: '#f59e0b' },
      { name: 'Insurance', value: stats.aiImpact.totalInsuranceLiability, color: '#3b82f6' },
      { name: 'Long-term', value: stats.aiImpact.totalLongTermCosts, color: '#10b981' }
    ];

    const thresholdBreakdown = [
      { name: 'Direct', value: stats.thresholdImpact.totalDirectCosts, color: '#8b5cf6' },
      { name: 'Indirect', value: stats.thresholdImpact.totalIndirectCosts, color: '#ec4899' },
      { name: 'Regulatory', value: stats.thresholdImpact.totalRegulatoryCompliance, color: '#f59e0b' },
      { name: 'Insurance', value: stats.thresholdImpact.totalInsuranceLiability, color: '#3b82f6' },
      { name: 'Long-term', value: stats.thresholdImpact.totalLongTermCosts, color: '#10b981' }
    ];

    const roi5Year = ((stats.costSavings * 1.5) / 75) * 100; // Assuming $75M AI investment over 5 years

return (
  <div className="min-h-screen bg-gray-950 text-white p-6">
<button
  onClick={props.onBack}
  className="fixed top-20 right-4 z-50 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold shadow-lg flex items-center gap-2 border-2 border-white transition-all"
>
  <ArrowLeftRight className="w-5 h-5" />
  Back to Home
</button>
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-4 border-2 border-green-600">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-300" />
              <div className="text-xs text-green-300">Total Savings</div>
            </div>
            <div className="text-2xl font-bold text-white">${stats.costSavings.toFixed(0)}M</div>
            <div className="text-xs text-green-300 mt-1">Per incident</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-lg p-4 border-2 border-blue-600">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-300" />
              <div className="text-xs text-blue-300">Time Saved</div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.downtimeSavings}</div>
            <div className="text-xs text-blue-300 mt-1">Days downtime avoided</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-4 border-2 border-purple-600">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-300" />
              <div className="text-xs text-purple-300">Detection Speed</div>
            </div>
            <div className="text-2xl font-bold text-white">{stats.timeAdvantage.toFixed(1)}s</div>
            <div className="text-xs text-purple-300 mt-1">Faster detection</div>
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-lg p-4 border-2 border-orange-600">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-300" />
              <div className="text-xs text-orange-300">5-Year ROI</div>
            </div>
            <div className="text-2xl font-bold text-white">{roi5Year.toFixed(0)}%</div>
            <div className="text-xs text-orange-300 mt-1">On $75M investment</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900 to-amber-900 rounded-lg p-4 border-2 border-yellow-600">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-300" />
              <div className="text-xs text-yellow-300">Cost/Minute</div>
            </div>
            <div className="text-2xl font-bold text-white">${(stats.thresholdImpact.costPerMinute / 1000).toFixed(0)}K</div>
            <div className="text-xs text-yellow-300 mt-1">Detection delay cost</div>
          </div>
        </div>

        {/* Cost Category Comparison */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Comprehensive Cost Comparison ($M)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={costComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend />
              <Bar dataKey="AI" fill="#8b5cf6" name="AI System" />
              <Bar dataKey="Threshold" fill="#ef4444" name="Threshold System" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Breakdown Pie Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">AI System Cost Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={aiBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {aiBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-purple-400">${stats.aiImpact.totalCost.toFixed(0)}M</div>
              <div className="text-sm text-gray-400">Total Impact</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Threshold System Cost Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={thresholdBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {thresholdBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-red-400">${stats.thresholdImpact.totalCost.toFixed(0)}M</div>
              <div className="text-sm text-gray-400">Total Impact</div>
            </div>
          </div>
        </div>

        {/* Detailed Cost Breakdown Tables */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">AI System - Detailed Costs</h3>
            <div className="space-y-2 text-sm">
              <div className="font-bold text-purple-300 border-b border-gray-700 pb-2">Direct Costs</div>
              {Object.entries(stats.aiImpact.directCosts).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-900 rounded">
                  <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-bold text-white">${value.toFixed(1)}M</span>
                </div>
              ))}
              <div className="font-bold text-pink-300 border-b border-gray-700 pb-2 pt-3">Indirect Costs</div>
              {Object.entries(stats.aiImpact.indirectCosts).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-900 rounded">
                  <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-bold text-white">${value.toFixed(1)}M</span>
                </div>
              ))}
              <div className="font-bold text-orange-300 border-b border-gray-700 pb-2 pt-3">Regulatory</div>
              {Object.entries(stats.aiImpact.regulatoryCosts).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-900 rounded">
                  <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-bold text-white">${value.toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-3">Threshold System - Detailed Costs</h3>
            <div className="space-y-2 text-sm">
              <div className="font-bold text-purple-300 border-b border-gray-700 pb-2">Direct Costs</div>
              {Object.entries(stats.thresholdImpact.directCosts).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-900 rounded">
                  <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-bold text-white">${value.toFixed(1)}M</span>
                </div>
              ))}
              <div className="font-bold text-pink-300 border-b border-gray-700 pb-2 pt-3">Indirect Costs</div>
              {Object.entries(stats.thresholdImpact.indirectCosts).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-900 rounded">
                  <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-bold text-white">${value.toFixed(1)}M</span>
                </div>
              ))}
              <div className="font-bold text-orange-300 border-b border-gray-700 pb-2 pt-3">Regulatory</div>
              {Object.entries(stats.thresholdImpact.regulatoryCosts).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-900 rounded">
                  <span className="text-gray-300">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-bold text-white">${value.toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTechnicalAnalysis = () => {
    if (!aiData || !thresholdData) return null;

    return (
      <div className="space-y-6">
        {/* Temperature Comparison */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Temperature Evolution Comparison</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="Timestamp" 
                stroke="#9ca3af"
                label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend />
              <Line 
                data={aiData}
                type="monotone" 
                dataKey="Actual_Temp" 
                stroke="#8b5cf6" 
                name="AI System - Actual Temp"
                dot={false}
                strokeWidth={2}
              />
              <Line 
                data={thresholdData}
                type="monotone" 
                dataKey="Actual_Temp" 
                stroke="#ef4444" 
                name="Threshold System - Actual Temp"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Detection Scores */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">AI Detection Scores Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={aiData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="Timestamp" 
                stroke="#9ca3af"
              />
              <YAxis 
                stroke="#9ca3af"
                domain={[0, 1]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="AI_Anomaly_Score" 
                stackId="1"
                stroke="#a855f7" 
                fill="#a855f7"
                name="Anomaly Score"
              />
              <Area 
                type="monotone" 
                dataKey="Physics_Deviation_Overall" 
                stackId="2"
                stroke="#22c55e" 
                fill="#22c55e"
                name="Physics Deviation"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Parameters Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Power Output Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="Timestamp" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Line data={aiData} type="monotone" dataKey="Power" stroke="#8b5cf6" name="AI System" dot={false} strokeWidth={2} />
                <Line data={thresholdData} type="monotone" dataKey="Power" stroke="#ef4444" name="Threshold" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Pressure Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="Timestamp" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Line data={aiData} type="monotone" dataKey="Pressure" stroke="#8b5cf6" name="AI System" dot={false} strokeWidth={2} />
                <Line data={thresholdData} type="monotone" dataKey="Pressure" stroke="#ef4444" name="Threshold" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Assessment Radar */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Risk Profile Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={[
              { metric: 'Meltdown Risk', AI: stats.aiImpact.meltdownProgress, Threshold: stats.thresholdImpact.meltdownProgress },
              { metric: 'Structural Damage', AI: stats.aiImpact.structuralDamage, Threshold: stats.thresholdImpact.structuralDamage },
              { metric: 'Radiation Level', AI: stats.aiImpact.radiationLevel, Threshold: stats.thresholdImpact.radiationLevel },
              { metric: 'Temperature Risk', AI: (stats.aiImpact.maxTemp - 290) / 1.1, Threshold: (stats.thresholdImpact.maxTemp - 290) / 1.1 },
              { metric: 'Pressure Risk', AI: (stats.aiImpact.maxPressure - 150) / 0.5, Threshold: (stats.thresholdImpact.maxPressure - 150) / 0.5 },
              { metric: 'Overall Risk', AI: stats.aiImpact.riskScore, Threshold: stats.thresholdImpact.riskScore }
            ]}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="AI System" dataKey="AI" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              <Radar name="Threshold System" dataKey="Threshold" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderRecoveryAnalysis = () => {
    if (!stats) return null;

    return (
      <div className="space-y-6">
        {/* Recovery Timeline Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-4 border-2 border-purple-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI System Recovery Timeline
            </h3>
            {stats.aiImpact.recoveryPhases.length > 0 ? (
              <div className="space-y-3">
                {stats.aiImpact.recoveryPhases.map((phase, i) => (
                  <div key={i} className="bg-purple-950 rounded p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-purple-300 font-bold">{phase.phase}</span>
                      <span className="text-sm text-white">{phase.days} days / ${phase.cost.toFixed(1)}M</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(phase.days / stats.aiImpact.downtime) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-green-900 rounded border border-green-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-green-300">Total Recovery Time</div>
                      <div className="text-2xl font-bold text-white">{stats.aiImpact.downtime} days</div>
                      <div className="text-xs text-green-400 mt-1">
                        ≈ {(stats.aiImpact.downtime / 30).toFixed(1)} months
                        {stats.aiImpact.downtime > 365 && ` (${(stats.aiImpact.downtime / 365).toFixed(1)} years)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-green-300">Revenue Loss</div>
                      <div className="text-2xl font-bold text-white">${stats.aiImpact.indirectCosts.lostRevenue.toFixed(0)}M</div>
                      <div className="text-xs text-green-400 mt-1">
                        ${(stats.aiImpact.indirectCosts.lostRevenue / stats.aiImpact.downtime).toFixed(2)}M per day
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-green-400">
                ✓ Minimal damage - Quick recovery
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-lg p-4 border-2 border-orange-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Threshold System Recovery Timeline
            </h3>
            {stats.thresholdImpact.recoveryPhases.length > 0 ? (
              <div className="space-y-3">
                {stats.thresholdImpact.recoveryPhases.map((phase, i) => (
                  <div key={i} className="bg-red-950 rounded p-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-orange-300 font-bold">{phase.phase}</span>
                      <span className="text-sm text-white">{phase.days} days / ${phase.cost.toFixed(1)}M</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${(phase.days / stats.thresholdImpact.downtime) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-4 bg-red-900 rounded border border-red-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-red-300">Total Recovery Time</div>
                      <div className="text-2xl font-bold text-white">{stats.thresholdImpact.downtime} days</div>
                      <div className="text-xs text-red-400 mt-1">
                        ≈ {(stats.thresholdImpact.downtime / 30).toFixed(1)} months
                        {stats.thresholdImpact.downtime > 365 && ` (${(stats.thresholdImpact.downtime / 365).toFixed(1)} years)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-red-300">Revenue Loss</div>
                      <div className="text-2xl font-bold text-white">${stats.thresholdImpact.indirectCosts.lostRevenue.toFixed(0)}M</div>
                      <div className="text-xs text-red-400 mt-1">
                        ${(stats.thresholdImpact.indirectCosts.lostRevenue / stats.thresholdImpact.downtime).toFixed(2)}M per day
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-green-400">
                ✓ Minimal damage - Quick recovery
              </div>
            )}
          </div>
        </div>

        {/* Impact Comparison Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Workforce Impact
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-sm text-gray-400">AI System</div>
                <div className="text-xl font-bold text-purple-400">{Math.floor(stats.aiImpact.downtime / 30 * 450)} person-months</div>
                <div className="text-xs text-gray-500 mt-1">Staffing during shutdown</div>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-sm text-gray-400">Threshold System</div>
                <div className="text-xl font-bold text-red-400">{Math.floor(stats.thresholdImpact.downtime / 30 * 450)} person-months</div>
                <div className="text-xs text-gray-500 mt-1">Staffing during shutdown</div>
              </div>
              <div className="p-3 bg-green-900 rounded border border-green-600">
                <div className="text-sm text-green-300">Workforce Savings</div>
                <div className="text-xl font-bold text-white">{Math.floor(stats.downtimeSavings / 30 * 450)} person-months</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              Environmental Impact
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-sm text-gray-400">AI System</div>
                <div className="text-xl font-bold text-purple-400">
                  ${stats.aiImpact.longTermCosts.environmentalRemediation.toFixed(0)}M
                </div>
                <div className="text-xs text-gray-500 mt-1">Remediation costs</div>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-sm text-gray-400">Threshold System</div>
                <div className="text-xl font-bold text-red-400">
                  ${stats.thresholdImpact.longTermCosts.environmentalRemediation.toFixed(0)}M
                </div>
                <div className="text-xs text-gray-500 mt-1">Remediation costs</div>
              </div>
              <div className="p-3 bg-green-900 rounded border border-green-600">
                <div className="text-sm text-green-300">Environmental Savings</div>
                <div className="text-xl font-bold text-white">
                  ${(stats.thresholdImpact.longTermCosts.environmentalRemediation - stats.aiImpact.longTermCosts.environmentalRemediation).toFixed(0)}M
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-400" />
              Regulatory Impact
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-sm text-gray-400">AI System</div>
                <div className="text-xl font-bold text-purple-400">
                  ${stats.aiImpact.totalRegulatoryCompliance.toFixed(0)}M
                </div>
                <div className="text-xs text-gray-500 mt-1">Total regulatory costs</div>
              </div>
              <div className="p-3 bg-gray-900 rounded">
                <div className="text-sm text-gray-400">Threshold System</div>
                <div className="text-xl font-bold text-red-400">
                  ${stats.thresholdImpact.totalRegulatoryCompliance.toFixed(0)}M
                </div>
                <div className="text-xs text-gray-500 mt-1">Total regulatory costs</div>
              </div>
              <div className="p-3 bg-green-900 rounded border border-green-600">
                <div className="text-sm text-green-300">Regulatory Savings</div>
                <div className="text-xl font-bold text-white">
                  ${(stats.thresholdImpact.totalRegulatoryCompliance - stats.aiImpact.totalRegulatoryCompliance).toFixed(0)}M
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Long-term Impact Analysis */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Long-term Cost Impact Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { category: 'Health Monitoring', AI: stats.aiImpact.longTermCosts.healthMonitoring, Threshold: stats.thresholdImpact.longTermCosts.healthMonitoring },
              { category: 'Environmental', AI: stats.aiImpact.longTermCosts.environmentalRemediation, Threshold: stats.thresholdImpact.longTermCosts.environmentalRemediation },
              { category: 'Reduced Capacity', AI: stats.aiImpact.longTermCosts.reducedCapacity, Threshold: stats.thresholdImpact.longTermCosts.reducedCapacity },
              { category: 'Reputation', AI: stats.aiImpact.longTermCosts.reputationalDamage, Threshold: stats.thresholdImpact.longTermCosts.reputationalDamage },
              { category: 'Supplier Penalties', AI: stats.aiImpact.longTermCosts.supplierPenalties, Threshold: stats.thresholdImpact.longTermCosts.supplierPenalties }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" label={{ value: 'Cost ($M)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Legend />
              <Bar dataKey="AI" fill="#8b5cf6" name="AI System" />
              <Bar dataKey="Threshold" fill="#ef4444" name="Threshold System" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderExecutiveSummary = () => {
    if (!stats) return null;

    const businessCase = [
      {
        metric: 'Cost Avoidance per Incident',
        value: `${stats.costSavings.toFixed(0)}M`,
        impact: 'High'
      },
      {
        metric: 'Downtime Reduction',
        value: `${stats.downtimeSavings} days`,
        impact: 'Critical'
      },
      {
        metric: 'Detection Speed Improvement',
        value: `${stats.timeAdvantage.toFixed(1)} seconds faster`,
        impact: 'High'
      },
      {
        metric: 'Regulatory Fine Reduction',
        value: `${(stats.thresholdImpact.totalRegulatoryCompliance - stats.aiImpact.totalRegulatoryCompliance).toFixed(0)}M`,
        impact: 'High'
      },
      {
        metric: 'Insurance Savings',
        value: `${(stats.thresholdImpact.totalInsuranceLiability - stats.aiImpact.totalInsuranceLiability).toFixed(0)}M`,
        impact: 'Medium'
      },
      {
        metric: 'Public Safety Enhancement',
        value: `${((stats.thresholdImpact.radiationLevel - stats.aiImpact.radiationLevel) / stats.thresholdImpact.radiationLevel * 100).toFixed(0)}% less radiation`,
        impact: 'Critical'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Executive Summary Header */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 rounded-xl p-6 border-2 border-blue-600">
          <h2 className="text-3xl font-bold text-white mb-4">Executive Summary</h2>
          <p className="text-blue-200 text-lg">
            Comprehensive analysis comparing AI-powered detection system against traditional threshold-based monitoring 
            for nuclear reactor safety incidents.
          </p>
        </div>

        {/* Key Business Metrics */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Business Impact Assessment</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="p-3 text-gray-300">Metric</th>
                  <th className="p-3 text-gray-300">Value</th>
                  <th className="p-3 text-gray-300">Business Impact</th>
                </tr>
              </thead>
              <tbody>
                {businessCase.map((item, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    <td className="p-3 text-white font-medium">{item.metric}</td>
                    <td className="p-3 text-cyan-400 font-bold">{item.value}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        item.impact === 'Critical' ? 'bg-red-900 text-red-300' :
                        item.impact === 'High' ? 'bg-orange-900 text-orange-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {item.impact}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-lg p-6 border-2 border-green-600">
            <h3 className="text-lg font-bold text-green-300 mb-3">Investment Case</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-green-400">Estimated AI System Investment</div>
                <div className="text-3xl font-bold text-white">$75M</div>
              </div>
              <div>
                <div className="text-sm text-green-400">Single Incident Savings</div>
                <div className="text-3xl font-bold text-white">${stats.costSavings.toFixed(0)}M</div>
              </div>
              <div>
                <div className="text-sm text-green-400">Payback Period</div>
                <div className="text-3xl font-bold text-white">
                  {(75 / stats.costSavings).toFixed(1)} incidents
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 rounded-lg p-6 border-2 border-blue-600">
            <h3 className="text-lg font-bold text-blue-300 mb-3">Risk Reduction</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-blue-400">Meltdown Risk Reduction</div>
                <div className="text-3xl font-bold text-white">
                  {((stats.thresholdImpact.meltdownProgress - stats.aiImpact.meltdownProgress) / stats.thresholdImpact.meltdownProgress * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-400">Radiation Exposure Reduction</div>
                <div className="text-3xl font-bold text-white">
                  {((stats.thresholdImpact.radiationLevel - stats.aiImpact.radiationLevel) / stats.thresholdImpact.radiationLevel * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-400">Overall Risk Score Improvement</div>
                <div className="text-3xl font-bold text-white">
                  {((stats.thresholdImpact.riskScore - stats.aiImpact.riskScore) / stats.thresholdImpact.riskScore * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-6 border-2 border-purple-600">
            <h3 className="text-lg font-bold text-purple-300 mb-3">Operational Excellence</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-purple-400">Revenue Protection</div>
                <div className="text-3xl font-bold text-white">
                  ${(stats.thresholdImpact.indirectCosts.lostRevenue - stats.aiImpact.indirectCosts.lostRevenue).toFixed(0)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-400">Uptime Improvement</div>
                <div className="text-3xl font-bold text-white">
                  {((stats.downtimeSavings / stats.thresholdImpact.downtime) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-purple-400">Detection Efficiency Gain</div>
                <div className="text-3xl font-bold text-white">
                  {((stats.timeAdvantage / stats.thresholdDetectionTime) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Strategic Recommendations</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-600">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-green-600 rounded-full p-2">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Immediate Implementation</h4>
                  <p className="text-sm text-gray-300">
                    Deploy AI detection system across all reactor units. ROI is achieved after just {(75 / stats.costSavings).toFixed(1)} incidents, 
                    with significant safety and financial benefits.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Enhanced Safety Protocols</h4>
                  <p className="text-sm text-gray-300">
                    AI system reduces meltdown risk by {((stats.thresholdImpact.meltdownProgress - stats.aiImpact.meltdownProgress) / stats.thresholdImpact.meltdownProgress * 100).toFixed(0)}% 
                    and radiation exposure by {((stats.thresholdImpact.radiationLevel - stats.aiImpact.radiationLevel) / stats.thresholdImpact.radiationLevel * 100).toFixed(0)}%, 
                    significantly improving public safety outcomes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-600">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-purple-600 rounded-full p-2">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Financial Optimization</h4>
                  <p className="text-sm text-gray-300">
                    Reduce regulatory fines by ${(stats.thresholdImpact.totalRegulatoryCompliance - stats.aiImpact.totalRegulatoryCompliance).toFixed(0)}M 
                    per incident and lower insurance premiums through demonstrated improved safety performance.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-600">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-orange-600 rounded-full p-2">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Regulatory Leadership</h4>
                  <p className="text-sm text-gray-300">
                    Position facility as industry leader in nuclear safety innovation. Early AI adoption demonstrates 
                    commitment to next-generation safety protocols and regulatory excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparative Scenario Analysis */}
        <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-4">Multi-Incident Projection (5-Year Analysis)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={[
              { incidents: 0, AI: 75, Threshold: 0, Savings: 0 },
              { incidents: 1, AI: 75 + stats.aiImpact.totalCost, Threshold: stats.thresholdImpact.totalCost, Savings: stats.costSavings },
              { incidents: 2, AI: 75 + stats.aiImpact.totalCost * 2, Threshold: stats.thresholdImpact.totalCost * 2, Savings: stats.costSavings * 2 },
              { incidents: 3, AI: 75 + stats.aiImpact.totalCost * 3, Threshold: stats.thresholdImpact.totalCost * 3, Savings: stats.costSavings * 3 },
              { incidents: 4, AI: 75 + stats.aiImpact.totalCost * 4, Threshold: stats.thresholdImpact.totalCost * 4, Savings: stats.costSavings * 4 },
              { incidents: 5, AI: 75 + stats.aiImpact.totalCost * 5, Threshold: stats.thresholdImpact.totalCost * 5, Savings: stats.costSavings * 5 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="incidents" 
                stroke="#9ca3af"
                label={{ value: 'Number of Incidents', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                label={{ value: 'Cumulative Cost ($M)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                formatter={(value) => `${value.toFixed(0)}M`}
              />
              <Legend />
              <Area type="monotone" dataKey="AI" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="AI System Total Cost" />
              <Area type="monotone" dataKey="Threshold" stackId="2" stroke="#ef4444" fill="#ef4444" name="Threshold System Total Cost" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-green-900 rounded border border-green-600">
            <div className="text-center">
              <div className="text-sm text-green-300">5-Year Projected Savings (assuming 5 incidents)</div>
              <div className="text-4xl font-bold text-white mt-2">${(stats.costSavings * 5).toFixed(0)}M</div>
              <div className="text-sm text-green-400 mt-1">
                Break-even after {Math.ceil(75 / stats.costSavings)} incidents | 
                Net savings: ${(stats.costSavings * 5 - 75).toFixed(0)}M over 5 years
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
        {/* Back to Home Button - Always Visible */}
<button
  onClick={props.onBack}
  className="fixed top-4 right-4 z-50 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-bold shadow-lg flex items-center gap-2 border-2 border-white transition-all"
>
  <ArrowLeftRight className="w-5 h-5" />
  Back to Home
</button>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-10 h-10 text-cyan-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Advanced Reactor Safety Analysis Platform
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Enterprise-grade business impact analysis for AI-powered nuclear reactor detection systems
        </p>
      </div>

      {/* File Upload Section */}
      {(!aiData || !thresholdData) && (
        <div className="max-w-6xl mx-auto mt-12">
          <div className="grid grid-cols-2 gap-8">
            {/* AI System Upload */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl border-2 border-purple-600 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">AI System Data</h2>
                <p className="text-purple-300 text-sm">
                  Upload CSV from AI-powered detection simulation
                </p>
              </div>

              <label className="block">
                <div className="border-2 border-dashed border-purple-600 rounded-lg p-8 text-center hover:border-purple-400 cursor-pointer transition-all hover:bg-purple-900/20">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, 'ai')}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                  <div className="text-purple-300 font-medium">
                    {aiFileName || 'Click to upload AI system CSV'}
                  </div>
                  <div className="text-sm text-purple-500 mt-2">
                    Supports CSV format only
                  </div>
                </div>
              </label>

              {aiData && (
                <div className="mt-4 p-4 bg-purple-950 rounded-lg border border-purple-600">
                  <div className="text-sm text-purple-300">✓ Successfully loaded: {aiData.length} data points</div>
                  <div className="text-xs text-purple-400 mt-1">{aiFileName}</div>
                </div>
              )}
            </div>

            {/* Threshold System Upload */}
            <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-xl border-2 border-orange-600 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <Shield className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Threshold System Data</h2>
                <p className="text-orange-300 text-sm">
                  Upload CSV from threshold-based detection simulation
                </p>
              </div>

              <label className="block">
                <div className="border-2 border-dashed border-orange-600 rounded-lg p-8 text-center hover:border-orange-400 cursor-pointer transition-all hover:bg-orange-900/20">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e, 'threshold')}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                  <div className="text-orange-300 font-medium">
                    {thresholdFileName || 'Click to upload Threshold system CSV'}
                  </div>
                  <div className="text-sm text-orange-500 mt-2">
                    Supports CSV format only
                  </div>
                </div>
              </label>

              {thresholdData && (
                <div className="mt-4 p-4 bg-red-950 rounded-lg border border-orange-600">
                  <div className="text-sm text-orange-300">✓ Successfully loaded: {thresholdData.length} data points</div>
                  <div className="text-xs text-orange-400 mt-1">{thresholdFileName}</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-xl border-2 border-blue-600">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-blue-300 mb-2">📋 Instructions</h3>
                <p className="text-blue-200 text-sm mb-3">
                  To generate a comprehensive business impact analysis:
                </p>
                <ol className="text-sm text-blue-200 space-y-2 list-decimal list-inside">
                  <li>Run the same attack scenario on both the AI-powered and Threshold-based reactor simulations</li>
                  <li>Export the CSV data files from both simulations</li>
                  <li>Upload both files using the panels above</li>
                  <li>Review comprehensive financial, operational, and safety impact analysis</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {aiData && thresholdData && stats && (
        <>
          {/* File Info Bar */}
          <div className="mb-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-gray-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-xs text-gray-400">AI System</div>
                    <div className="font-bold text-purple-400">{aiFileName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-xs text-gray-400">Threshold System</div>
                    <div className="font-bold text-orange-400">{thresholdFileName}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setAiData(null);
                  setThresholdData(null);
                  setAiFileName('');
                  setThresholdFileName('');
                  setActiveTab('business');
                }}
                className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 rounded-lg transition-all font-medium shadow-lg"
              >
                📁 Load Different Files
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-6 flex gap-2 bg-gray-800 rounded-xl p-2 border-2 border-gray-700 shadow-lg">
            <button
              onClick={() => setActiveTab('executive')}
              className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all ${
                activeTab === 'executive'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📊 Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all ${
                activeTab === 'business'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💰 Business Impact
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all ${
                activeTab === 'technical'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔬 Technical Analysis
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`flex-1 px-6 py-4 rounded-lg font-bold transition-all ${
                activeTab === 'recovery'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔧 Recovery & Impact
            </button>
          </div>

          {/* Tab Content */}
          <div className="animate-fadeIn">
            {activeTab === 'executive' && renderExecutiveSummary()}
            {activeTab === 'business' && renderBusinessImpact()}
            {activeTab === 'technical' && renderTechnicalAnalysis()}
            {activeTab === 'recovery' && renderRecoveryAnalysis()}
          </div>
        </>
      )}
    </div>
  );
}