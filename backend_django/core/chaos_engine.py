"""
UniRide CTMS v2.0 — Chaos Engineering Framework (SE Feature)
Implements controlled fault injection, network latency simulation,
and microservice failure degradation to test system resilience.
"""

import asyncio
import logging
import random
import time
from functools import wraps
from typing import Any, Callable

logger = logging.getLogger("uniride.chaos")


class ChaosMonkey:
    """
    Chaos Monkey for resilience validation.
    Injects synthetic latencies, connection drops, and simulated microservice crashes.
    """

    def __init__(self, failure_rate: float = 0.0, max_latency_sec: float = 2.0, enabled: bool = False):
        self.failure_rate = failure_rate
        self.max_latency_sec = max_latency_sec
        self.enabled = enabled

    def maybe_inject_latency(self) -> float:
        """Inject random latency if enabled."""
        if not self.enabled:
            return 0.0
        if random.random() < self.failure_rate:
            delay = random.uniform(0.1, self.max_latency_sec)
            logger.warning(f"💥 [CHAOS] Injected network latency: {delay:.3f}s")
            time.sleep(delay)
            return delay
        return 0.0

    async def maybe_inject_async_latency(self) -> float:
        """Async variant of latency injection."""
        if not self.enabled:
            return 0.0
        if random.random() < self.failure_rate:
            delay = random.uniform(0.1, self.max_latency_sec)
            logger.warning(f"💥 [CHAOS] Injected async network latency: {delay:.3f}s")
            await asyncio.sleep(delay)
            return delay
        return 0.0

    def maybe_fail_service(self, service_name: str = "C# DSA Service") -> None:
        """Simulate upstream microservice failure."""
        if not self.enabled:
            return
        if random.random() < self.failure_rate:
            logger.error(f"💥 [CHAOS] Simulated sudden microservice drop: {service_name}")
            raise ConnectionError(f"[Chaos Engineering] Simulated failure connecting to {service_name}")


# Global default instance
chaos = ChaosMonkey(failure_rate=0.05, max_latency_sec=1.5, enabled=False)


def chaos_resilience_test(name: str):
    """Decorator to mark endpoints or functions participating in chaos stress testing."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            chaos.maybe_inject_latency()
            return func(*args, **kwargs)
        return wrapper
    return decorator
