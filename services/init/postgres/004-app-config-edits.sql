CREATE SCHEMA IF NOT EXISTS dcf_edits;

set search_path=dcf_edits,public;

-- replaced by collection_edit/item_edit below
DROP FUNCTION IF EXISTS dcf_edits.insert_edit(TEXT, TEXT, TEXT, JSONB);
DROP TABLE IF EXISTS dcf_edits.edit;

-- keyed by ES @id; no row = private
CREATE TABLE IF NOT EXISTS dcf_edits.collection_edit (
  collection_id TEXT PRIMARY KEY,
  visibility TEXT CHECK (visibility IN ('public', 'private')),
  edit JSONB NOT NULL DEFAULT '{}',
  featured_image TEXT,
  updated_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dcf_edits.item_edit (
  item_id TEXT PRIMARY KEY,
  collection_id TEXT NOT NULL,
  edit JSONB NOT NULL DEFAULT '{}',
  updated_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS item_edit_collection_id_idx ON dcf_edits.item_edit (collection_id);
