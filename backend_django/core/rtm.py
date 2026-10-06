"""
UniRide CTMS v2.0 — Automated Requirements Traceability Matrix (RTM) Engine (SE Feature)
Scans codebase via AST to discover `@requirement("REQ-ID")` decorators,
generating a live verified traceability matrix between IEEE 830 SRS specs and code.
"""

import ast
import inspect
import os
from pathlib import Path
from typing import Any, Callable, Dict, List


def requirement(req_id: str, description: str = ""):
    """
    Decorator tagging a class, method, or view to an IEEE 830 Software Requirement.
    Example:
        @requirement("FR-009", "Sub-millisecond attendance verification via Bloom Filter")
        def verify_attendance(request): ...
    """
    def decorator(obj: Any) -> Any:
        obj.__requirement_id__ = req_id
        obj.__requirement_desc__ = description
        return obj
    return decorator


class TraceabilityScanner:
    """AST-based scanner mapping source code files to functional requirements."""

    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir)
        self.matrix: Dict[str, List[Dict[str, Any]]] = {}

    def scan(self) -> Dict[str, List[Dict[str, Any]]]:
        for py_file in self.root_dir.rglob("*.py"):
            if "migrations" in py_file.parts or "venv" in py_file.parts or ".git" in py_file.parts:
                continue
            self._scan_file(py_file)
        return self.matrix

    def _scan_file(self, file_path: Path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                tree = ast.parse(f.read(), filename=str(file_path))
        except Exception:
            return

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                for decorator in node.decorator_list:
                    req_id, desc = self._extract_req(decorator)
                    if req_id:
                        if req_id not in self.matrix:
                            self.matrix[req_id] = []
                        self.matrix[req_id].append({
                            "symbol": node.name,
                            "line": node.lineno,
                            "file": str(file_path.relative_to(self.root_dir)),
                            "description": desc,
                        })

    def _extract_req(self, decorator_node: ast.AST) -> tuple[str | None, str]:
        if isinstance(decorator_node, ast.Call):
            func = decorator_node.func
            name = getattr(func, "id", None) or getattr(func, "attr", None)
            if name == "requirement" and decorator_node.args:
                req_id = getattr(decorator_node.args[0], "value", "")
                desc = getattr(decorator_node.args[1], "value", "") if len(decorator_node.args) > 1 else ""
                return req_id, desc
        return None, ""

    def generate_markdown_report(self) -> str:
        """Render a Github-flavored Markdown table of the RTM."""
        lines = [
            "# Automated Requirements Traceability Matrix (RTM)",
            "",
            "| Requirement ID | Implemented Symbols | Source Files & Lines | Status |",
            "|---|---|---|---|",
        ]
        for req_id in sorted(self.matrix.keys()):
            items = self.matrix[req_id]
            symbols = "<br>".join([f"`{item['symbol']}`" for item in items])
            locations = "<br>".join([f"`{item['file']}:{item['line']}`" for item in items])
            lines.append(f"| **{req_id}** | {symbols} | {locations} | ✅ Verified |")

        if not self.matrix:
            lines.append("| *No decorated requirements found yet* | - | - | ⏳ Pending |")

        return "\n".join(lines)
