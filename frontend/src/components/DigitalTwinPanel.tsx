"use client";

import React, { useState } from "react";
import { Play, RotateCcw, CloudRain, Cpu, BarChart3, AlertOctagon } from "lucide-react";
import { runDigitalTwinSimulation } from "@/lib/api";

export default function DigitalTwinPanel() {
  const [numBuses, setNumBuses] = useState(12);
  const [arrivalRate, setArrivalRate] = useState(450);
  const [trafficFactor, setTrafficFactor] = useState(1.0);
  const [rainMode, setRainMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<{
    kpis: {
      total_passengers_served: number;
      unserved_stranded_passengers: number;
      average_passenger_wait_minutes: number;
      service_level_percent: number;
      overcrowding_probability: number;
      fleet_total_distance_km: number;
      estimated_fuel_burn_liters: number;
      estimated_fuel_expenditure_pkr: number;
    };
    digital_twin_status: string;
    scenario_recommendation: string;
  } | null>(null);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    const data = await runDigitalTwinSimulation(numBuses, arrivalRate, trafficFactor, rainMode);
    setResults(data);
    setIsSimulating(false);
  };

  return (
    <div className="card p-6 shadow-sm border-[var(--powder-blue)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--ice-blue)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--ice-blue)] text-[var(--sapphire)] shadow-xs">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--navy)] font-display">Campus Transport Digital Twin</h3>
            <p className="text-xs font-mono text-[var(--sapphire)] font-semibold">SimPy Discrete-Event Simulation • 100x Accelerated Time</p>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="btn btn-primary btn-sm flex items-center gap-2 py-2 px-4 shadow-sm"
        >
          <Play className={`h-3.5 w-3.5 ${isSimulating ? "animate-spin" : ""}`} />
          <span>{isSimulating ? "Executing Monte Carlo Run..." : "Run 'What-If' Simulation"}</span>
        </button>
      </div>

      {/* Control Sliders Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        {/* Fleet Size */}
        <div className="rounded-2xl bg-[var(--off-white)] p-3.5 border border-[var(--ice-blue)]">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Fleet Buses:</span>
            <span className="text-[var(--navy)] font-bold">{numBuses} Buses</span>
          </div>
          <input
            type="range"
            min={4}
            max={24}
            value={numBuses}
            onChange={(e) => setNumBuses(Number(e.target.value))}
            className="mt-2.5 w-full accent-[var(--sapphire)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
            <span>4 Min</span>
            <span>24 Max</span>
          </div>
        </div>

        {/* Commuter Demand */}
        <div className="rounded-2xl bg-[var(--off-white)] p-3.5 border border-[var(--ice-blue)]">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Student Arrival:</span>
            <span className="text-[var(--navy)] font-bold">{arrivalRate} /hr</span>
          </div>
          <input
            type="range"
            min={100}
            max={1200}
            step={50}
            value={arrivalRate}
            onChange={(e) => setArrivalRate(Number(e.target.value))}
            className="mt-2.5 w-full accent-[var(--sapphire)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
            <span>100 (Quiet)</span>
            <span>1,200 (Rush)</span>
          </div>
        </div>

        {/* Traffic Factor */}
        <div className="rounded-2xl bg-[var(--off-white)] p-3.5 border border-[var(--ice-blue)]">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Traffic Factor:</span>
            <span className="text-[var(--navy)] font-bold">{trafficFactor.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min={0.8}
            max={2.5}
            step={0.1}
            value={trafficFactor}
            onChange={(e) => setTrafficFactor(Number(e.target.value))}
            className="mt-2.5 w-full accent-[var(--sapphire)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
            <span>0.8x Free</span>
            <span>2.5x Gridlock</span>
          </div>
        </div>

        {/* Weather condition */}
        <div className="rounded-2xl bg-[var(--off-white)] p-3.5 border border-[var(--ice-blue)] flex flex-col justify-between">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Weather Condition:</span>
            <span className={rainMode ? "text-amber-600 font-bold" : "text-emerald-600 font-bold"}>
              {rainMode ? "Monsoon Rain (+35% delay)" : "Clear Sky"}
            </span>
          </div>
          <button
            onClick={() => setRainMode(!rainMode)}
            className={`mt-2 flex items-center justify-center gap-2 rounded-xl py-1.5 text-xs font-semibold transition-all ${
              rainMode
                ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                : "bg-white text-[var(--navy)] border border-[var(--powder-blue)] hover:bg-[var(--ice-blue-light)]"
            }`}
          >
            <CloudRain className="h-4 w-4" />
            <span>{rainMode ? "Rain Event Active" : "Toggle Rain Mode"}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Output */}
      {results ? (
        <div className="mt-6 space-y-4 font-mono animate-fadeIn">
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 text-xs">
            <span className="text-emerald-900 font-bold block mb-1">
              DIGITAL TWIN RECOMMENDATION:
            </span>
            <p className="text-emerald-800">{results.scenario_recommendation}</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3">
              <span className="text-[var(--text-muted)]">Passengers Served</span>
              <p className="text-xl font-bold text-[var(--navy)] mt-1">
                {results.kpis.total_passengers_served}
              </p>
              <span className="text-[10px] text-emerald-600">
                Service Level: {results.kpis.service_level_percent}%
              </span>
            </div>

            <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3">
              <span className="text-[var(--text-muted)]">Stranded Commuters</span>
              <p className="text-xl font-bold text-red-600 mt-1">
                {results.kpis.unserved_stranded_passengers}
              </p>
              <span className="text-[10px] text-red-500">
                Overcrowd Prob: {results.kpis.overcrowding_probability}
              </span>
            </div>

            <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3">
              <span className="text-[var(--text-muted)]">Avg Wait Time</span>
              <p className="text-xl font-bold text-[var(--sapphire)] mt-1">
                {results.kpis.average_passenger_wait_minutes} min
              </p>
              <span className="text-[10px] text-[var(--text-secondary)]">Queue latency metric</span>
            </div>

            <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3">
              <span className="text-[var(--text-muted)]">Projected Fuel Burn</span>
              <p className="text-xl font-bold text-[var(--navy)] mt-1">
                {results.kpis.estimated_fuel_burn_liters} L
              </p>
              <span className="text-[10px] text-[var(--text-secondary)]">
                PKR {results.kpis.estimated_fuel_expenditure_pkr.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--powder-blue)] p-8 text-center text-xs font-mono text-[var(--text-muted)]">
          Adjust fleet size, student arrival velocity, or traffic factor above and click &quot;Run What-If Simulation&quot;.
        </div>
      )}
    </div>
  );
}
