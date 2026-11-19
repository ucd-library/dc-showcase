

## Automatted imports from Preservica:

  - Set sync flag in Preservica id.
  - This is picked up by: `bronze_preservica_auto_sync` sensor
    - This syncs items to bronze folder.
  - The `bronze_collection_cask_audit` sensor scans to bronze folder for changes
    - This triggers the `bronze_reconcile_collection` job
  - The `bronze_reconcile_collection` job to build the tree structure for the items in the collection.
    - This triggers the `gold_dcs_process_collection` job to process the collection if new or updated
    - This triggers the `gold_dcs_process_item` job for each item in the collection.s
  - `gold_dcs_process_collection` this just process the collection metadata
  - The `gold_dcs_process_item` job builds silver derivatives, copies access/preservation binaries into gold for showcase downloads, and builds / indexes the item documents in elastic.
  - Finally the `gold_dcs_collection_rollup_trigger` sensor will detect when all items that have been added to pg for processing are completed.  This will watch for either item or collection changes that have completed.
    - Triggers the `gold_dcs_collection_rollup` job 
  - The `gold_dcs_collection_rollup` job will index the collection and update the item count in showcase.
  
Additionally there is a cron in the dcs app that checks the collection item count vs whats in the collection document and updates if off.

## Manual Run.

  - Start the `bronze_preservica_import_collection` job with the collection name (ref)
    - builds the bronze by-ref and tree folders.
  - The `bronze_collection_cask_audit` sensor scans to bronze folder for changes
    - This triggers the `bronze_reconcile_collection` job
  - Now see [above automated import](#automatted-imports-from-preservica) for the rest of the process. starting with the `bronze_reconcile_collection` job to build the tree structure for the items in the collection.

## 