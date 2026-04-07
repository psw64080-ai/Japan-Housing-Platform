-- PostgreSQL Database Setup Script for Japan Housing Platform
-- Run this script to initialize the database

-- 데이터베이스 생성 (이미 생성되어 있다면 스킵)
-- CREATE DATABASE japan_housing;

-- 사용자 롤 생성 (이미 생성되어 있다면 스킵)
-- CREATE USER developer WITH PASSWORD 'password123';
-- GRANT ALL PRIVILEGES ON DATABASE japan_housing TO developer;

-- 테이블 생성 (Spring JPA이 자동으로 생성하지만, 필요시 수동으로 생성)

-- Users 테이블
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    phone_number VARCHAR(20),
    nationality VARCHAR(100),
    preferred_languages VARCHAR(255),
    profile_image TEXT,
    average_rating DOUBLE PRECISION,
    review_count INTEGER,
    is_foreigner_friendly BOOLEAN,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties 테이블
CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    landlord_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    monthly_price INTEGER NOT NULL,
    deposit INTEGER,
    deposit_amount INTEGER,
    key_money INTEGER,
    room_type VARCHAR(50) NOT NULL,
    floor_area DOUBLE PRECISION,
    floor INTEGER,
    total_floors INTEGER,
    images TEXT,
    amenities TEXT,
    pet_friendly BOOLEAN,
    foreigner_welcome BOOLEAN,
    contract_type VARCHAR(50),
    nearby_station VARCHAR(100),
    min_walking_distance INTEGER,
    max_walking_distance INTEGER,
    average_rating DOUBLE PRECISION,
    review_count INTEGER,
    view_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    listing_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews 테이블
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    reviewer_id BIGINT NOT NULL REFERENCES users(id),
    reviewed_user_id BIGINT NOT NULL REFERENCES users(id),
    rating DOUBLE PRECISION,
    comment TEXT,
    property_condition INTEGER,
    landlord_friendliness INTEGER,
    communication INTEGER,
    neighborhood INTEGER,
    photo_urls TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts 테이블
CREATE TABLE IF NOT EXISTS contracts (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    tenant_id BIGINT NOT NULL REFERENCES users(id),
    landlord_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(50),
    contract_document TEXT,
    contract_start_date DATE,
    contract_end_date DATE,
    monthly_rent INTEGER,
    deposit INTEGER,
    key_money INTEGER,
    special_terms TEXT,
    tenant_signed BOOLEAN DEFAULT false,
    landlord_signed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages 테이블
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    receiver_id BIGINT NOT NULL REFERENCES users(id),
    property_id BIGINT REFERENCES properties(id),
    content TEXT NOT NULL,
    original_language VARCHAR(10),
    translated_content TEXT,
    translated_language VARCHAR(10),
    file_urls TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ShareHouses 테이블
CREATE TABLE IF NOT EXISTS sharehouses (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    monthly_price INTEGER NOT NULL,
    images TEXT,
    amenities TEXT,
    house_rules TEXT,
    current_residents INTEGER DEFAULT 0,
    max_residents INTEGER,
    resident_profiles TEXT,
    monthly_events TEXT,
    trial_period_days INTEGER DEFAULT 7,
    average_rating DOUBLE PRECISION,
    review_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_monthly_price ON properties(monthly_price);
CREATE INDEX IF NOT EXISTS idx_properties_address ON properties(address);
CREATE INDEX IF NOT EXISTS idx_properties_foreigner_welcome ON properties(foreigner_welcome);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_sharehouses_owner ON sharehouses(owner_id);

-- 데모 데이터 삽입 (선택사항)
INSERT INTO users (email, name, role, nationality, is_foreigner_friendly, created_at) VALUES
('owner1@example.com', 'Tanaka (大家)', 'LANDLORD', 'Japan', true, NOW()),
('owner2@example.com', 'Yamada (大家)', 'LANDLORD', 'Japan', true, NOW()),
('foreign1@example.com', 'Kim (借主)', 'SEEKER', 'Korea', false, NOW()),
('foreign2@example.com', 'Lee (借主)', 'SEEKER', 'Taiwan', false, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO properties (landlord_id, title, address, monthly_price, deposit, room_type, floor_area, contract_type, foreigner_welcome, created_at) VALUES
(1, '新宿駅徒歩1分新築アパート', '東京都新宿区新宿', 150000, 300000, '1K', 25.5, '月租', true, NOW()),
(1, '渋谷駅近く2DK', '東京都渋谷区渋谷', 180000, 360000, '2DK', 35.0, '月租', true, NOW()),
(2, '池袋駅前1DK', '東京都豊島区池袋', 120000, 240000, '1DK', 28.0, '月租', true, NOW())
ON CONFLICT DO NOTHING;

-- 완성!
