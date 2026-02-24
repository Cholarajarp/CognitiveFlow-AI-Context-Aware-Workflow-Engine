import pygetwindow as gw

def get_active_window_info():
    try:
        window = gw.getActiveWindow()
        if window:
            return {"title": window.title, "app_name": window.title.split(" - ")[-1] if " - " in window.title else window.title}
        return {"title": "Unknown", "app_name": "Unknown"}
    except Exception as e:
        return {"title": "Error detecting window", "app_name": "Error", "details": str(e)}
