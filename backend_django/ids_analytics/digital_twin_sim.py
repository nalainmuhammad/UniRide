"""
UniRide CTMS v2.0 — Campus Transport Digital Twin (IDS Feature 4)
Discrete-event simulation engine modeling campus transit operations,
passenger queues, stop dwell times, and 'What-If' operational scenarios.
"""

import math
import random
from typing import Any, Dict, List


class DigitalTwinSimulator:
    """
    Simulates campus transport fleet in accelerated time.
    Evaluates policy changes and unexpected disruptions risk-free.
    """

    def run_scenario(
        self,
        num_buses: int = 12,
        passenger_arrival_rate_per_hour: int = 450,
        traffic_congestion_factor: float = 1.0,
        rain_disruption: bool = False,
        simulated_duration_minutes: int = 180,
    ) -> Dict[str, Any]:
        """
        Execute a Monte Carlo discrete simulation of the transit network.
        """
        random.seed(42)  # Deterministic seed for reproducible evaluation

        effective_traffic = traffic_congestion_factor * (1.35 if rain_disruption else 1.0)
        base_travel_time_between_stops = 8.0  # minutes

        stops_count = 6
        bus_capacity = 50
        fuel_consumption_liters_per_km = 0.28
        fuel_cost_per_liter = 285.0  # PKR

        # Simulation tracking
        total_boarded = 0
        total_waiting_time = 0.0
        bus_trips_completed = 0
        stranded_passengers = 0
        overcrowded_events = 0

        # Passenger arrival generation
        arrivals_per_minute = passenger_arrival_rate_per_hour / 60.0
        total_arriving_passengers = int(arrivals_per_minute * simulated_duration_minutes)

        # Bus fleet simulation
        buses = [
            {"id": i, "passengers": 0, "current_stop": i % stops_count, "next_arrival": i * 10.0}
            for i in range(num_buses)
        ]

        current_time = 0.0
        stop_queues = [0] * stops_count

        while current_time < simulated_duration_minutes:
            current_time += 1.0

            # Passengers arrive at stops
            for s in range(stops_count):
                if random.random() < (arrivals_per_minute / stops_count):
                    stop_queues[s] += 1

            # Advance buses
            for b in buses:
                if current_time >= b["next_arrival"]:
                    # Arrived at stop
                    curr_stop = b["current_stop"]
                    
                    # Offload random passengers
                    offloading = random.randint(0, min(10, b["passengers"]))
                    b["passengers"] -= offloading

                    # Board waiting passengers
                    waiting = stop_queues[curr_stop]
                    available_space = bus_capacity - b["passengers"]
                    boarded = min(waiting, available_space)
                    
                    b["passengers"] += boarded
                    stop_queues[curr_stop] -= boarded
                    total_boarded += boarded

                    if b["passengers"] >= bus_capacity * 0.95:
                        overcrowded_events += 1

                    # Schedule next hop
                    b["current_stop"] = (curr_stop + 1) % stops_count
                    travel_time = (base_travel_time_between_stops * effective_traffic) + (boarded * 0.1)
                    b["next_arrival"] = current_time + travel_time
                    bus_trips_completed += 1

        # Calculate metrics
        stranded_passengers = sum(stop_queues)
        avg_wait_minutes = round((12.0 * effective_traffic) + (stranded_passengers * 0.05), 1)
        total_km_travelled = bus_trips_completed * 4.2
        fuel_liters = total_km_travelled * fuel_consumption_liters_per_km
        fuel_cost = fuel_liters * fuel_cost_per_liter

        overcrowd_prob = min(0.95, round(overcrowded_events / max(1, bus_trips_completed), 2))

        return {
            "parameters": {
                "num_buses": num_buses,
                "passenger_arrival_rate_per_hour": passenger_arrival_rate_per_hour,
                "traffic_congestion_factor": traffic_congestion_factor,
                "rain_disruption": rain_disruption,
                "simulated_duration_minutes": simulated_duration_minutes,
            },
            "kpis": {
                "total_passengers_served": total_boarded,
                "unserved_stranded_passengers": stranded_passengers,
                "average_passenger_wait_minutes": avg_wait_minutes,
                "service_level_percent": round((total_boarded / max(1, total_arriving_passengers)) * 100, 1),
                "overcrowding_probability": overcrowd_prob,
                "fleet_total_distance_km": round(total_km_travelled, 1),
                "estimated_fuel_burn_liters": round(fuel_liters, 1),
                "estimated_fuel_expenditure_pkr": round(fuel_cost, 0),
            },
            "digital_twin_status": "COMPLETED",
            "scenario_recommendation": (
                "Deploy 2 additional buses to mitigate severe peak-hour queue buildup."
                if avg_wait_minutes > 15.0 or stranded_passengers > 50
                else "Fleet deployment is within optimal operational tolerance."
            ),
        }


digital_twin = DigitalTwinSimulator()
