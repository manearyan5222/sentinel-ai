import re
import ipaddress
from urllib.parse import urlparse
from typing import Tuple

BLOCKED_SCHEMES = {"file", "ftp", "gopher", "data", "javascript", "dict", "ldap", "tftp", "php"}
ALLOWED_SCHEMES = {"rtsp", "http", "https"}

def is_private_or_local_host(hostname: str) -> bool:
    """Checks if a hostname or IP string resolves to loopback, link-local, or private RFC1918 addresses."""
    if not hostname:
        return True
    
    clean_host = hostname.strip().lower()
    if clean_host in ("localhost", "0.0.0.0", "::1", "[::1]"):
        return True
    
    # Strip port if present in raw hostname
    if ":" in clean_host and not clean_host.startswith("["):
        clean_host = clean_host.split(":")[0]
    
    try:
        ip_obj = ipaddress.ip_address(clean_host)
        return (
            ip_obj.is_loopback or
            ip_obj.is_private or
            ip_obj.is_link_local or
            ip_obj.is_reserved or
            ip_obj.is_multicast or
            ip_obj.is_unspecified
        )
    except ValueError:
        # It is a domain name (e.g., 'camera.example.com')
        # Block domains explicitly matching localhost or metadata services
        if clean_host.endswith(".localhost") or clean_host in ("localhost.localdomain", "metadata.google.internal"):
            return True
        return False

def validate_camera_source(source_path: str, stream_type: str = "RTSP", demo_mode: bool = True) -> Tuple[bool, str]:
    """
    Validates camera source_path against SSRF vectors, dangerous protocols, and unauthorized local file access.
    Returns (is_valid, error_message).
    """
    if not source_path or not source_path.strip():
        return False, "Camera source_path cannot be empty."

    source = source_path.strip()
    stream_type_upper = (stream_type or "RTSP").upper()

    # 1. Webcam index (e.g., "0", "1")
    if stream_type_upper == "WEBCAM" or source.isdigit():
        return True, "Valid webcam device index."

    # 2. Local Demo Video File
    if stream_type_upper == "DEMO" or source.endswith((".mp4", ".avi", ".mkv", ".mov")):
        if not demo_mode:
            return False, "Local sample video playback is only permitted in DEMO_MODE."
        
        # Ensure path is confined to sample_data
        normalized = source.replace("\\", "/")
        if "sample_data" in normalized:
            # Check for arbitrary directory escape
            if normalized.startswith(("../sample_data/", "sample_data/", "./sample_data/")):
                return True, "Valid demo sample video path."
        return False, "Demo video paths must reside within the designated sample_data directory."

    # 3. Scheme and URL Validation
    try:
        parsed = urlparse(source)
    except Exception:
        return False, "Invalid URL structure."

    scheme = (parsed.scheme or "").lower()

    if scheme in BLOCKED_SCHEMES:
        return False, f"Prohibited URL scheme '{scheme}://'. Camera feeds must use RTSP or HTTPS."

    if scheme not in ALLOWED_SCHEMES:
        return False, f"Unsupported stream protocol '{scheme}://'. Allowed protocols: rtsp://, https://, http://."

    hostname = parsed.hostname
    if not hostname:
        return False, "Camera stream URL must contain a valid remote host."

    # 4. SSRF Check against localhost, 127.0.0.1, 169.254.x.x, RFC1918
    if is_private_or_local_host(hostname):
        return False, f"Access to localhost, link-local (169.254.x.x), or private internal host '{hostname}' is blocked."

    return True, "Valid camera stream URL."
