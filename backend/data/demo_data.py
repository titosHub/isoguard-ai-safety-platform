"""Demo data for development and testing."""
from datetime import datetime, timedelta
import random
import uuid

# Users
DEMO_USERS = [
    {"id": "usr-001", "email": "admin@safetyvision.com", "full_name": "John Admin", "role": "admin", "is_active": True, "site_ids": ["site-001", "site-002", "site-003"], "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.S.Y.Z.YwJK1234"},  # password: admin123
    {"id": "usr-002", "email": "safety@safetyvision.com", "full_name": "Jane Safety", "role": "safety_officer", "is_active": True, "site_ids": ["site-001"], "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.S.Y.Z.YwJK1234"},
    {"id": "usr-003", "email": "operator@safetyvision.com", "full_name": "Bob Operator", "role": "operator", "is_active": True, "site_ids": ["site-001", "site-002"], "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.S.Y.Z.YwJK1234"},
]

# Sites
DEMO_SITES = [
    {"id": "site-001", "name": "Main Construction Site", "address": "123 Industrial Ave, New York, NY", "latitude": 40.7128, "longitude": -74.0060, "timezone": "America/New_York", "is_active": True, "camera_count": 5, "zone_count": 3},
    {"id": "site-002", "name": "Warehouse Complex B", "address": "456 Storage Rd, Chicago, IL", "latitude": 41.8781, "longitude": -87.6298, "timezone": "America/Chicago", "is_active": True, "camera_count": 3, "zone_count": 2},
    {"id": "site-003", "name": "Manufacturing Plant", "address": "789 Factory Blvd, Detroit, MI", "latitude": 42.3314, "longitude": -83.0458, "timezone": "America/Detroit", "is_active": True, "camera_count": 8, "zone_count": 4},
    {"id": "site-004", "name": "International Airport Terminal A", "address": "1 Airport Blvd, Los Angeles, CA", "latitude": 33.9425, "longitude": -118.4081, "timezone": "America/Los_Angeles", "is_active": True, "camera_count": 12, "zone_count": 6},
    # Mining Sites
    {"id": "site-005", "name": "Gold Mine Alpha", "address": "100 Mining Rd, Johannesburg, GP", "latitude": -26.2041, "longitude": 28.0473, "timezone": "Africa/Johannesburg", "is_active": True, "camera_count": 8, "zone_count": 5, "commodity": "gold"},
    {"id": "site-006", "name": "Platinum Mine Beta", "address": "200 Mineral Ave, Rustenburg, NW", "latitude": -25.6667, "longitude": 27.2500, "timezone": "Africa/Johannesburg", "is_active": True, "camera_count": 10, "zone_count": 6, "commodity": "platinum"},
    {"id": "site-007", "name": "Coal Mine Gamma", "address": "300 Energy St, eMalahleni, MP", "latitude": -25.8861, "longitude": 29.2331, "timezone": "Africa/Johannesburg", "is_active": True, "camera_count": 6, "zone_count": 4, "commodity": "coal"},
    {"id": "site-008", "name": "Chrome Mine Delta", "address": "400 Chrome Blvd, Steelpoort, LP", "latitude": -24.6833, "longitude": 30.0500, "timezone": "Africa/Johannesburg", "is_active": True, "camera_count": 5, "zone_count": 3, "commodity": "chrome"},
]

# Zones
DEMO_ZONES = [
    {"id": "zone-001", "name": "Heavy Equipment Area", "zone_type": "exclusion", "site_id": "site-001", "is_active": True},
    {"id": "zone-002", "name": "Loading Dock", "zone_type": "restricted", "site_id": "site-001", "is_active": True},
    {"id": "zone-003", "name": "Main Entrance", "zone_type": "mandatory_ppe", "site_id": "site-001", "is_active": True},
    {"id": "zone-004", "name": "Storage Area A", "zone_type": "restricted", "site_id": "site-002", "is_active": True},
    {"id": "zone-005", "name": "Assembly Line", "zone_type": "mandatory_ppe", "site_id": "site-003", "is_active": True},
    # Airport Security Zones
    {"id": "zone-006", "name": "Departure Lounge", "zone_type": "security_monitored", "site_id": "site-004", "is_active": True},
    {"id": "zone-007", "name": "Baggage Claim", "zone_type": "security_monitored", "site_id": "site-004", "is_active": True},
    {"id": "zone-008", "name": "Security Checkpoint", "zone_type": "high_security", "site_id": "site-004", "is_active": True},
    {"id": "zone-009", "name": "Gate Area B1-B10", "zone_type": "security_monitored", "site_id": "site-004", "is_active": True},
    {"id": "zone-010", "name": "Arrivals Hall", "zone_type": "security_monitored", "site_id": "site-004", "is_active": True},
    {"id": "zone-011", "name": "Restricted Tarmac Access", "zone_type": "exclusion", "site_id": "site-004", "is_active": True},
    # Mining Zones - Gold Mine
    {"id": "zone-012", "name": "Shaft Level 1 - Main Excavation", "zone_type": "underground", "site_id": "site-005", "is_active": True},
    {"id": "zone-013", "name": "Shaft Level 2 - Development Area", "zone_type": "underground", "site_id": "site-005", "is_active": True},
    {"id": "zone-014", "name": "Shaft Level 3 - Stope Mining", "zone_type": "underground_hazard", "site_id": "site-005", "is_active": True},
    {"id": "zone-015", "name": "Surface Operations", "zone_type": "surface", "site_id": "site-005", "is_active": True},
    {"id": "zone-016", "name": "Processing Plant", "zone_type": "processing", "site_id": "site-005", "is_active": True},
    # Mining Zones - Platinum Mine
    {"id": "zone-017", "name": "Main Decline", "zone_type": "underground", "site_id": "site-006", "is_active": True},
    {"id": "zone-018", "name": "Stoping Area North", "zone_type": "underground_hazard", "site_id": "site-006", "is_active": True},
    {"id": "zone-019", "name": "Conveyor System", "zone_type": "transport", "site_id": "site-006", "is_active": True},
    {"id": "zone-020", "name": "Equipment Bay", "zone_type": "maintenance", "site_id": "site-006", "is_active": True},
    {"id": "zone-021", "name": "Ventilation Shaft", "zone_type": "underground", "site_id": "site-006", "is_active": True},
    # Mining Zones - Coal Mine
    {"id": "zone-022", "name": "Continuous Miner Section", "zone_type": "underground_hazard", "site_id": "site-007", "is_active": True},
    {"id": "zone-023", "name": "Longwall Face", "zone_type": "underground_hazard", "site_id": "site-007", "is_active": True},
    {"id": "zone-024", "name": "Coal Handling Plant", "zone_type": "processing", "site_id": "site-007", "is_active": True},
]

# Cameras
DEMO_CAMERAS = [
    {"id": "cam-001", "name": "Entrance Camera", "stream_url": "rtsp://192.168.1.100:554/stream1", "location_description": "Main Entrance", "site_id": "site-001", "zone_id": "zone-003", "is_active": True, "status": "online"},
    {"id": "cam-002", "name": "Dock Camera", "stream_url": "rtsp://192.168.1.101:554/stream1", "location_description": "Loading Dock", "site_id": "site-001", "zone_id": "zone-002", "is_active": True, "status": "online"},
    {"id": "cam-003", "name": "Equipment Area Cam", "stream_url": "rtsp://192.168.1.102:554/stream1", "location_description": "Heavy Equipment Zone", "site_id": "site-001", "zone_id": "zone-001", "is_active": True, "status": "online"},
    {"id": "cam-004", "name": "Warehouse Cam 1", "stream_url": "rtsp://192.168.2.100:554/stream1", "location_description": "Storage Area", "site_id": "site-002", "zone_id": "zone-004", "is_active": True, "status": "offline"},
    {"id": "cam-005", "name": "Assembly Line Cam", "stream_url": "rtsp://192.168.3.100:554/stream1", "location_description": "Assembly Line", "site_id": "site-003", "zone_id": "zone-005", "is_active": True, "status": "online"},
    # Airport Security Cameras
    {"id": "cam-006", "name": "Departure Lounge Cam 1", "stream_url": "rtsp://192.168.4.100:554/stream1", "location_description": "Departure Lounge West", "site_id": "site-004", "zone_id": "zone-006", "is_active": True, "status": "online"},
    {"id": "cam-007", "name": "Departure Lounge Cam 2", "stream_url": "rtsp://192.168.4.101:554/stream1", "location_description": "Departure Lounge East", "site_id": "site-004", "zone_id": "zone-006", "is_active": True, "status": "online"},
    {"id": "cam-008", "name": "Baggage Claim Cam", "stream_url": "rtsp://192.168.4.102:554/stream1", "location_description": "Baggage Carousel Area", "site_id": "site-004", "zone_id": "zone-007", "is_active": True, "status": "online"},
    {"id": "cam-009", "name": "Security Checkpoint Cam", "stream_url": "rtsp://192.168.4.103:554/stream1", "location_description": "TSA Checkpoint", "site_id": "site-004", "zone_id": "zone-008", "is_active": True, "status": "online"},
    {"id": "cam-010", "name": "Gate Area Cam", "stream_url": "rtsp://192.168.4.104:554/stream1", "location_description": "Gates B1-B5", "site_id": "site-004", "zone_id": "zone-009", "is_active": True, "status": "online"},
    {"id": "cam-011", "name": "Arrivals Hall Cam", "stream_url": "rtsp://192.168.4.105:554/stream1", "location_description": "Main Arrivals Area", "site_id": "site-004", "zone_id": "zone-010", "is_active": True, "status": "online"},
    # Mining Cameras - Gold Mine
    {"id": "cam-012", "name": "Underground Cam L1-A", "stream_url": "rtsp://192.168.5.100:554/stream1", "location_description": "Shaft Level 1 Main Face", "site_id": "site-005", "zone_id": "zone-012", "is_active": True, "status": "online"},
    {"id": "cam-013", "name": "Underground Cam L2-B", "stream_url": "rtsp://192.168.5.101:554/stream1", "location_description": "Development Heading", "site_id": "site-005", "zone_id": "zone-013", "is_active": True, "status": "online"},
    {"id": "cam-014", "name": "Stope Face Cam", "stream_url": "rtsp://192.168.5.102:554/stream1", "location_description": "Active Stope Face", "site_id": "site-005", "zone_id": "zone-014", "is_active": True, "status": "online"},
    {"id": "cam-015", "name": "Surface Operations Cam", "stream_url": "rtsp://192.168.5.103:554/stream1", "location_description": "Headgear Area", "site_id": "site-005", "zone_id": "zone-015", "is_active": True, "status": "online"},
    # Mining Cameras - Platinum Mine
    {"id": "cam-016", "name": "Decline Entry Cam", "stream_url": "rtsp://192.168.6.100:554/stream1", "location_description": "Main Decline Entrance", "site_id": "site-006", "zone_id": "zone-017", "is_active": True, "status": "online"},
    {"id": "cam-017", "name": "Conveyor Monitoring Cam", "stream_url": "rtsp://192.168.6.101:554/stream1", "location_description": "Main Conveyor Belt", "site_id": "site-006", "zone_id": "zone-019", "is_active": True, "status": "online"},
    {"id": "cam-018", "name": "TMM Tracking Cam", "stream_url": "rtsp://192.168.6.102:554/stream1", "location_description": "Equipment Bay", "site_id": "site-006", "zone_id": "zone-020", "is_active": True, "status": "online"},
    # Mining Cameras - Coal Mine
    {"id": "cam-019", "name": "Continuous Miner Cam", "stream_url": "rtsp://192.168.7.100:554/stream1", "location_description": "CM Section 1", "site_id": "site-007", "zone_id": "zone-022", "is_active": True, "status": "online"},
    {"id": "cam-020", "name": "Longwall Face Cam", "stream_url": "rtsp://192.168.7.101:554/stream1", "location_description": "Longwall Section", "site_id": "site-007", "zone_id": "zone-023", "is_active": True, "status": "online"},
]

# Detection types
DETECTION_TYPES = [
    {"value": "no_hardhat", "label": "No Hardhat"},
    {"value": "no_safety_vest", "label": "No Safety Vest"},
    {"value": "no_safety_glasses", "label": "No Safety Glasses"},
    {"value": "no_gloves", "label": "No Gloves"},
    {"value": "proximity_violation", "label": "Proximity Violation"},
    {"value": "exclusion_zone_breach", "label": "Exclusion Zone Breach"},
    {"value": "fall_detection", "label": "Fall Detection"},
    {"value": "fire_smoke", "label": "Fire/Smoke"},
    # Airport Security Detection Types
    {"value": "unattended_bag", "label": "Unattended Bag"},
    {"value": "suspicious_package", "label": "Suspicious Package"},
    {"value": "loitering", "label": "Loitering Detection"},
    {"value": "crowd_density", "label": "Crowd Density Alert"},
    {"value": "perimeter_breach", "label": "Perimeter Breach"},
    # Mining Safety Detection Types
    {"value": "fall_of_ground", "label": "Fall of Ground (FOG)"},
    {"value": "tmm_collision", "label": "TMM Collision Risk"},
    {"value": "air_quality", "label": "Air Quality Alert"},
    {"value": "noise_level", "label": "Noise Level Warning"},
    {"value": "seismic_activity", "label": "Seismic Activity"},
    {"value": "confined_space", "label": "Confined Space Alert"},
    {"value": "equipment_malfunction", "label": "Equipment Malfunction"},
    {"value": "ventilation_issue", "label": "Ventilation Issue"},
    {"value": "gas_detection", "label": "Gas Detection (Methane/CO)"},
    {"value": "conveyor_fire", "label": "Conveyor Belt Fire"},
]


def generate_incidents(count: int = 50):
    """Generate demo incidents."""
    incidents = []
    severities = ["critical", "high", "medium", "low"]
    statuses = ["open", "investigating", "resolved", "closed"]
    
    for i in range(count):
        site = random.choice(DEMO_SITES)
        zones = [z for z in DEMO_ZONES if z["site_id"] == site["id"]]
        zone = random.choice(zones) if zones else None
        cameras = [c for c in DEMO_CAMERAS if c["site_id"] == site["id"]]
        camera = random.choice(cameras) if cameras else DEMO_CAMERAS[0]
        detection = random.choice(DETECTION_TYPES)
        
        detected_at = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        incidents.append({
            "id": f"INC-{str(i+1).zfill(6)}",
            "title": f"{detection['label']} detected",
            "description": f"{detection['label']} detected in {zone['name'] if zone else 'Unknown Zone'}",
            "severity": random.choice(severities),
            "status": random.choice(statuses),
            "detection_type": detection["value"],
            "site_id": site["id"],
            "site_name": site["name"],
            "zone_id": zone["id"] if zone else None,
            "zone_name": zone["name"] if zone else None,
            "camera_id": camera["id"],
            "camera_name": camera["name"],
            "detected_at": detected_at.isoformat(),
            "confidence_score": round(0.85 + random.random() * 0.14, 2),
            "is_false_positive": random.random() > 0.9,
            "evidence_urls": [f"/evidence/{i}_blurred.jpg"],
            "created_at": detected_at.isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        })
    
    return sorted(incidents, key=lambda x: x["detected_at"], reverse=True)


def generate_alerts(count: int = 20):
    """Generate demo alerts."""
    alerts = []
    severities = ["critical", "high", "medium", "low"]
    
    for i in range(count):
        site = random.choice(DEMO_SITES)
        camera = random.choice([c for c in DEMO_CAMERAS if c["site_id"] == site["id"]] or DEMO_CAMERAS)
        detection = random.choice(DETECTION_TYPES)
        
        created_at = datetime.utcnow() - timedelta(hours=random.randint(0, 48))
        
        alerts.append({
            "id": str(uuid.uuid4()),
            "type": detection["value"],
            "title": f"{detection['label']} Alert",
            "description": f"{detection['label']} detected at {camera['location_description']}",
            "severity": random.choice(severities),
            "site_id": site["id"],
            "site_name": site["name"],
            "camera_id": camera["id"],
            "camera_name": camera["name"],
            "acknowledged": random.random() > 0.6,
            "created_at": created_at.isoformat(),
        })
    
    return sorted(alerts, key=lambda x: x["created_at"], reverse=True)


# Pre-generate data
DEMO_INCIDENTS = generate_incidents(50)
DEMO_ALERTS = generate_alerts(20)
