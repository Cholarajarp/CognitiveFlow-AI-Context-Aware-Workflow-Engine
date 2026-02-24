import logging
import platform

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import pygetwindow, but handle failure gracefully (e.g. in headless environments)
try:
    import pygetwindow as gw
    HAS_PYGETWINDOW = True
except (ImportError, Exception):
    HAS_PYGETWINDOW = False
    logger.warning("pygetwindow not available. Context detection will use mock data.")

def get_active_window_info():
    """
    Returns the active window title and app name.
    In a headless environment (or if pygetwindow fails), returns a mock context.
    """
    if not HAS_PYGETWINDOW:
        return _get_mock_context("pygetwindow not installed")

    try:
        # verify if we can actually access the display
        if platform.system() == "Linux" and not os.environ.get("DISPLAY"):
             return _get_mock_context("Headless Linux Environment")

        window = gw.getActiveWindow()
        if window:
            title = window.title.strip()
            # Simple heuristic to extract app name
            app_name = title.split(" - ")[-1] if " - " in title else title
            return {"title": title, "app_name": app_name}
        return {"title": "Desktop", "app_name": "System"}
    except Exception as e:
        logger.error(f"Window detection error: {e}")
        return _get_mock_context(str(e))

def _get_mock_context(reason: str):
    return {
        "title": "CognitiveFlow - Dev Environment",
        "app_name": "VS Code",
        "note": f"Context detection simulated ({reason})"
    }

import os
