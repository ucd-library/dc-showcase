CREATE SCHEMA IF NOT EXISTS v1_port;

set search_path=v1_port,public;

-- it appears v1 root paths come in lengths of 5, 6 and 7
CREATE TABLE IF NOT EXISTS redirects (
    id SERIAL PRIMARY KEY,
    source TEXT NOT NULL UNIQUE,
    destination TEXT NOT NULL UNIQUE,
    status_code INTEGER DEFAULT 301
);
CREATE INDEX IF NOT EXISTS idx_redirects_source ON redirects (source);