"""
UniRide CTMS v2.0 — IDS Analytics Unit Tests
Validates ML attendance predictor, DBSCAN trajectory analyzer,
NLP sentiment engine, digital twin simulator, and Bayesian causal engine.
"""

from datetime import date
from django.test import TestCase

from .attendance_predictor import predictor
from .trajectory_analyzer import analyzer
from .sentiment_engine import nlp_engine
from .digital_twin_sim import digital_twin
from .causal_engine import causal_engine


class AttendancePredictorTests(TestCase):
    """Tests Random Forest demand forecasting."""

    def test_predict_weekday_demand(self):
        # Monday = high demand
        result = predictor.predict_route_demand(1, date(2026, 10, 5))  # Monday
        self.assertIn("total_predicted_passengers", result)
        self.assertGreater(result["total_predicted_passengers"], 0)
        self.assertIn("recommended_bus_count", result)
        self.assertIn("stops_breakdown", result)

    def test_predict_weekend_low_demand(self):
        # Sunday
        result = predictor.predict_route_demand(1, date(2026, 10, 11))  # Sunday
        self.assertIn("total_predicted_passengers", result)
        # Weekend should be much lower
        weekday = predictor.predict_route_demand(1, date(2026, 10, 5))
        self.assertLess(result["total_predicted_passengers"], weekday["total_predicted_passengers"])

    def test_absenteeism_risk_healthy(self):
        result = predictor.predict_student_absenteeism_risk(1, 90, 100)
        self.assertEqual(result["risk_level"], "HEALTHY")

    def test_absenteeism_risk_critical(self):
        result = predictor.predict_student_absenteeism_risk(2, 20, 100)
        self.assertEqual(result["risk_level"], "CRITICAL")
        self.assertTrue(result["intervention_recommended"])


class TrajectoryAnalyzerTests(TestCase):
    """Tests DBSCAN bottleneck discovery and trajectory anomaly detection."""

    def test_bottleneck_fallback_sparse_data(self):
        # Less than 4 slow points triggers fallback
        points = [{"latitude": 33.66, "longitude": 73.08, "speed": 8.0}]
        clusters = analyzer.discover_bottlenecks(points)
        self.assertGreater(len(clusters), 0)
        self.assertIn("congestion_severity", clusters[0])

    def test_bottleneck_with_sufficient_data(self):
        # Generate 10 slow points near same location
        points = [
            {"latitude": 33.663 + i * 0.001, "longitude": 73.084 + i * 0.001, "speed": 5.0 + i * 0.5}
            for i in range(10)
        ]
        clusters = analyzer.discover_bottlenecks(points)
        self.assertIsInstance(clusters, list)

    def test_speeding_anomaly_detection(self):
        trajectory = [
            {"latitude": 33.60, "longitude": 73.00, "speed": 40.0, "timestamp": "2026-10-05T08:00:00"},
            {"latitude": 33.61, "longitude": 73.01, "speed": 80.0, "timestamp": "2026-10-05T08:05:00"},
        ]
        anomalies = analyzer.detect_trajectory_anomalies(trajectory)
        self.assertEqual(len(anomalies), 1)
        self.assertEqual(anomalies[0]["type"], "SPEEDING_VIOLATION")
        self.assertEqual(anomalies[0]["severity"], "CRITICAL")

    def test_harsh_braking_detection(self):
        trajectory = [
            {"latitude": 33.60, "longitude": 73.00, "speed": 55.0, "timestamp": "T1"},
            {"latitude": 33.61, "longitude": 73.01, "speed": 10.0, "timestamp": "T2"},
        ]
        anomalies = analyzer.detect_trajectory_anomalies(trajectory)
        harsh = [a for a in anomalies if a["type"] == "HARSH_BRAKING"]
        self.assertEqual(len(harsh), 1)

    def test_no_anomalies_normal_driving(self):
        trajectory = [
            {"latitude": 33.60, "longitude": 73.00, "speed": 35.0},
            {"latitude": 33.61, "longitude": 73.01, "speed": 40.0},
        ]
        anomalies = analyzer.detect_trajectory_anomalies(trajectory)
        self.assertEqual(len(anomalies), 0)


class SentimentEngineTests(TestCase):
    """Tests NLP sentiment analysis and topic extraction."""

    def test_positive_feedback(self):
        result = nlp_engine.analyze_feedback("Excellent safe on time drive!", 5)
        self.assertEqual(result["sentiment_label"], "POSITIVE")
        self.assertGreater(result["sentiment_score"], 0)

    def test_negative_feedback(self):
        result = nlp_engine.analyze_feedback("Terrible reckless driving, very late and dirty bus", 1)
        self.assertEqual(result["sentiment_label"], "NEGATIVE")
        self.assertLess(result["sentiment_score"], 0)
        self.assertTrue(result["requires_admin_review"])

    def test_neutral_feedback(self):
        result = nlp_engine.analyze_feedback("Average ride today", 3)
        self.assertEqual(result["sentiment_label"], "NEUTRAL")

    def test_topic_detection_driving(self):
        result = nlp_engine.analyze_feedback("The driver was rash and reckless on GT road", 2)
        self.assertIn("DRIVING_SAFETY", result["detected_topics"])

    def test_topic_detection_punctuality(self):
        result = nlp_engine.analyze_feedback("Always late and delayed, missed my exam", 1)
        self.assertIn("PUNCTUALITY", result["detected_topics"])

    def test_fleet_sentiment_summary_empty(self):
        result = nlp_engine.generate_fleet_sentiment_summary([])
        self.assertIn("average_sentiment_score", result)

    def test_fleet_sentiment_summary_with_data(self):
        feedbacks = [
            {"sentiment_score": 0.8, "sentiment_label": "POSITIVE"},
            {"sentiment_score": -0.3, "sentiment_label": "NEGATIVE"},
            {"sentiment_score": 0.1, "sentiment_label": "NEUTRAL"},
        ]
        result = nlp_engine.generate_fleet_sentiment_summary(feedbacks)
        self.assertEqual(result["total_reviews"], 3)
        self.assertAlmostEqual(result["average_sentiment_score"], 0.2, places=1)


class DigitalTwinTests(TestCase):
    """Tests Monte Carlo discrete-event simulation."""

    def test_default_scenario(self):
        result = digital_twin.run_scenario()
        self.assertEqual(result["digital_twin_status"], "COMPLETED")
        self.assertIn("kpis", result)
        kpis = result["kpis"]
        self.assertGreater(kpis["total_passengers_served"], 0)
        self.assertGreater(kpis["fleet_total_distance_km"], 0)

    def test_rainy_scenario_higher_delays(self):
        normal = digital_twin.run_scenario(rain_disruption=False)
        rainy = digital_twin.run_scenario(rain_disruption=True)
        self.assertGreaterEqual(
            rainy["kpis"]["average_passenger_wait_minutes"],
            normal["kpis"]["average_passenger_wait_minutes"]
        )

    def test_fewer_buses_more_stranded(self):
        few = digital_twin.run_scenario(num_buses=3)
        many = digital_twin.run_scenario(num_buses=15)
        self.assertGreaterEqual(
            few["kpis"]["unserved_stranded_passengers"],
            many["kpis"]["unserved_stranded_passengers"]
        )

    def test_high_traffic_congestion(self):
        result = digital_twin.run_scenario(traffic_congestion_factor=3.0)
        self.assertGreater(result["kpis"]["average_passenger_wait_minutes"], 12.0)


class CausalEngineTests(TestCase):
    """Tests Bayesian causal inference and counterfactual analysis."""

    def test_clear_weather_low_probabilities(self):
        result = causal_engine.query_causal_effect(weather="CLEAR", rush_hour=False, road_block=False)
        probs = result["posterior_probabilities"]
        self.assertLess(probs["probability_traffic_gridlock"], 0.5)

    def test_storm_high_probabilities(self):
        result = causal_engine.query_causal_effect(weather="STORM", rush_hour=True, road_block=True)
        probs = result["posterior_probabilities"]
        self.assertGreater(probs["probability_traffic_gridlock"], 0.7)
        self.assertGreater(probs["probability_bus_arrival_delayed"], 0.5)

    def test_counterfactual_ate_positive(self):
        result = causal_engine.query_causal_effect(weather="RAIN", rush_hour=True)
        ate = result["counterfactual_analysis"]["average_treatment_effect_ate"]
        self.assertGreater(ate, 0)  # Removing delays should reduce absences

    def test_dag_structure_present(self):
        result = causal_engine.query_causal_effect()
        self.assertIn("dag_structure", result)
        self.assertEqual(len(result["dag_structure"]["nodes"]), 4)
        self.assertEqual(len(result["dag_structure"]["edges"]), 4)
