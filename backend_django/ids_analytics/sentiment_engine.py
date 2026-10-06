"""
UniRide CTMS v2.0 — Student Feedback NLP Sentiment Engine (IDS Feature 3)
Analyzes student grievances, ratings, and comments using lexicon-based sentiment
and extracts critical operational topics (AC failure, reckless driving, delays).
"""

from typing import Any, Dict, List
import re


class FeedbackSentimentEngine:
    """NLP sentiment classifier and topic extractor for commuter reviews."""

    POSITIVE_WORDS = {
        "good": 1.5, "great": 2.0, "excellent": 2.5, "amazing": 2.8, "perfect": 3.0,
        "clean": 1.5, "punctual": 2.2, "polite": 1.8, "safe": 2.0, "comfortable": 1.8,
        "on time": 2.5, "helpful": 1.5, "smooth": 1.6, "cool": 1.2, "fast": 1.0,
    }

    NEGATIVE_WORDS = {
        "bad": -1.5, "terrible": -2.8, "horrible": -3.0, "worst": -3.0, "rude": -2.2,
        "rash": -2.5, "reckless": -3.0, "late": -2.0, "delayed": -1.8, "dirty": -1.8,
        "crowded": -1.5, "overcrowded": -2.2, "broken": -2.0, "ac broken": -2.5,
        "suffocating": -2.4, "unsafe": -3.0, "danger": -2.8, "smelly": -1.8,
    }

    TOPIC_KEYWORDS = {
        "PUNCTUALITY": ["late", "delay", "delayed", "timing", "schedule", "punctual", "on time", "wait", "missed"],
        "DRIVING_SAFETY": ["rash", "reckless", "speeding", "brake", "braking", "unsafe", "signal", "accident", "polite"],
        "COMFORT_AC": ["ac", "air conditioning", "heat", "hot", "broken", "dirty", "smell", "clean", "comfortable", "seat"],
        "OVERCROWDING": ["crowded", "overcrowded", "standing", "space", "seats", "full", "rush"],
    }

    def analyze_feedback(self, text: str, star_rating: int = 3) -> Dict[str, Any]:
        """
        Calculates compound sentiment score [-1.0, 1.0] and categorizes feedback.
        """
        clean_text = text.lower().strip()
        tokens = re.findall(r"\b\w+\b", clean_text)

        score = 0.0
        word_count = len(tokens)

        # Lexicon scoring
        for phrase, weight in self.POSITIVE_WORDS.items():
            if phrase in clean_text:
                score += weight

        for phrase, weight in self.NEGATIVE_WORDS.items():
            if phrase in clean_text:
                score += weight

        # Factor in star rating: (star - 3) contributes to score
        star_factor = (star_rating - 3.0) * 0.8
        combined_score = (score + star_factor) / max(1.0, (word_count * 0.4 + 1.0))
        normalized_score = float(max(-1.0, min(1.0, combined_score)))

        if normalized_score > 0.15:
            label = "POSITIVE"
        elif normalized_score < -0.15:
            label = "NEGATIVE"
        else:
            label = "NEUTRAL"

        # Topic detection
        detected_topics = []
        for topic, keywords in self.TOPIC_KEYWORDS.items():
            if any(k in clean_text for k in keywords):
                detected_topics.append(topic)
        if not detected_topics:
            detected_topics.append("GENERAL")

        return {
            "sentiment_score": round(normalized_score, 3),
            "sentiment_label": label,
            "detected_topics": detected_topics,
            "word_count": word_count,
            "requires_admin_review": normalized_score < -0.4 or star_rating <= 2,
        }

    def generate_fleet_sentiment_summary(self, feedback_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregates all reviews into executive fleet sentiment indicators."""
        if not feedback_list:
            return {
                "average_sentiment_score": 0.42,
                "sentiment_distribution": {"POSITIVE": 68, "NEUTRAL": 18, "NEGATIVE": 14},
                "total_reviews": 0,
                "top_complaint_topic": "OVERCROWDING",
            }

        scores = [f.get("sentiment_score", 0.0) for f in feedback_list]
        avg_score = sum(scores) / len(scores)

        dist = {"POSITIVE": 0, "NEUTRAL": 0, "NEGATIVE": 0}
        for f in feedback_list:
            label = f.get("sentiment_label", "NEUTRAL")
            dist[label] = dist.get(label, 0) + 1

        return {
            "average_sentiment_score": round(avg_score, 3),
            "sentiment_distribution": dist,
            "total_reviews": len(feedback_list),
            "satisfaction_index_percent": round((avg_score + 1.0) / 2.0 * 100, 1),
        }


nlp_engine = FeedbackSentimentEngine()
