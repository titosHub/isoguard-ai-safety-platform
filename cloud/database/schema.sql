-- SafetyVision PostgreSQL Database Schema
-- Run this against your RDS PostgreSQL instance

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================
-- CORE TABLES
-- =====================

-- Sites (Facilities/Locations)
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50) DEFAULT 'UTC',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Zones within sites
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    zone_type VARCHAR(100), -- 'restricted', 'ppe_required', 'hazard', etc.
    polygon JSONB, -- GeoJSON polygon
    rules JSONB, -- Zone-specific safety rules
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cameras
CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    stream_url TEXT,
    status VARCHAR(50) DEFAULT 'offline',
    edge_device_id VARCHAR(100),
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Edge Devices
CREATE TABLE IF NOT EXISTS edge_devices (
    id VARCHAR(100) PRIMARY KEY,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'offline',
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    camera_count INTEGER DEFAULT 0,
    active_cameras INTEGER DEFAULT 0,
    ip_address VARCHAR(45),
    version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- DETECTION TABLES
-- =====================

-- Detections (main detection records)
CREATE TABLE IF NOT EXISTS detections (
    id VARCHAR(100) PRIMARY KEY,
    camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    edge_device_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    violations JSONB NOT NULL DEFAULT '[]',
    safety_score DECIMAL(5, 2),
    frame_number BIGINT,
    evidence_url TEXT,
    is_false_positive BOOLEAN DEFAULT false,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_id VARCHAR(100) REFERENCES detections(id) ON DELETE CASCADE,
    camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    severity VARCHAR(50) NOT NULL, -- 'critical', 'high', 'medium', 'low'
    violations JSONB NOT NULL DEFAULT '[]',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Violation Comments
CREATE TABLE IF NOT EXISTS violation_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    detection_id VARCHAR(100) NOT NULL REFERENCES detections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- USER & AUTH TABLES
-- =====================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer', -- 'admin', 'manager', 'operator', 'viewer'
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Site permissions
CREATE TABLE IF NOT EXISTS user_sites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer',
    PRIMARY KEY (user_id, site_id)
);

-- =====================
-- CONFIGURATION TABLES
-- =====================

-- Safety Policies
CREATE TABLE IF NOT EXISTS safety_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rules JSONB NOT NULL DEFAULT '{}',
    detection_types JSONB DEFAULT '[]',
    alert_threshold VARCHAR(50) DEFAULT 'high',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Models
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    model_type VARCHAR(100), -- 'yolo', 'custom', etc.
    detection_classes JSONB DEFAULT '[]',
    s3_path TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- ANALYTICS TABLES
-- =====================

-- Daily aggregated stats
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_detections INTEGER DEFAULT 0,
    total_violations INTEGER DEFAULT 0,
    violations_by_type JSONB DEFAULT '{}',
    avg_safety_score DECIMAL(5, 2),
    alerts_generated INTEGER DEFAULT 0,
    alerts_acknowledged INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, date)
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON detections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_detections_site_id ON detections(site_id);
CREATE INDEX IF NOT EXISTS idx_detections_camera_id ON detections(camera_id);
CREATE INDEX IF NOT EXISTS idx_detections_site_timestamp ON detections(site_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_site_id ON alerts(site_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);

CREATE INDEX IF NOT EXISTS idx_cameras_site_id ON cameras(site_id);
CREATE INDEX IF NOT EXISTS idx_cameras_edge_device_id ON cameras(edge_device_id);

CREATE INDEX IF NOT EXISTS idx_zones_site_id ON zones(site_id);

CREATE INDEX IF NOT EXISTS idx_edge_devices_site_id ON edge_devices(site_id);
CREATE INDEX IF NOT EXISTS idx_edge_devices_status ON edge_devices(status);

CREATE INDEX IF NOT EXISTS idx_daily_stats_site_date ON daily_stats(site_id, date DESC);

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_policies_updated_at BEFORE UPDATE ON safety_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date DATE)
RETURNS void AS $$
BEGIN
    INSERT INTO daily_stats (site_id, date, total_detections, total_violations, avg_safety_score)
    SELECT 
        site_id,
        target_date,
        COUNT(*),
        SUM(jsonb_array_length(violations)),
        AVG(safety_score)
    FROM detections
    WHERE DATE(timestamp) = target_date
    GROUP BY site_id
    ON CONFLICT (site_id, date) 
    DO UPDATE SET
        total_detections = EXCLUDED.total_detections,
        total_violations = EXCLUDED.total_violations,
        avg_safety_score = EXCLUDED.avg_safety_score;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- INITIAL DATA
-- =====================

-- Insert default detection types
INSERT INTO ai_models (name, version, model_type, detection_classes, is_active)
VALUES (
    'SafetyVision Default',
    '1.0.0',
    'yolo',
    '["no_helmet", "no_vest", "no_goggles", "no_gloves", "restricted_zone", "fall_detected", "fire_detected", "spill_detected", "blocked_exit", "no_harness"]'::jsonb,
    true
) ON CONFLICT DO NOTHING;
