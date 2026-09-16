CREATE SCHEMA IF NOT EXISTS dams_edits;

set search_path=dams_edits,public;

CREATE TABLE IF NOT EXISTS dams_edits.edit (
  dams_edits_id SERIAL PRIMARY KEY,
  collection_id TEXT NOT NULL,
  item_id TEXT,
  edit_id TEXT NOT NULL,
  edit JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (collection_id, item_id, edit_id)
);
CREATE INDEX IF NOT EXISTS edit_collection_id_idx ON dams_edits.edit (collection_id);
CREATE INDEX IF NOT EXISTS edit_item_id_idx ON dams_edits.edit (item_id);
CREATE INDEX IF NOT EXISTS edit_edit_id_idx ON dams_edits.edit (edit_id);

CREATE OR REPLACE FUNCTION dams_edits.insert_edit(
  collection_id_in TEXT,
  item_id_in TEXT,
  edit_id_in TEXT,
  edit_in JSONB
) RETURNS VOID AS $$
BEGIN
  INSERT INTO dams_edits.edit (collection_id, item_id, edit_id, edit)
  VALUES (collection_id_in, item_id_in, edit_id_in, edit_in);
END;
$$ LANGUAGE plpgsql;