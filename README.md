# dc-showcase
Digital Collections Showcase application built on top of Argonath

# Quick Start
##### Ingesting data for local-dev
1. Bring the _argonath_ cluster up, then the _showcase_ cluster.
1. Run the [argonath init script](https://github.com/ucd-library/argonath-deployment/blob/main/cmds/local-dev/init.sh), which builds the necessary postgres tables in both clusters, as well as seeding the gold cask application files necessary for the showcase app.
1. In _dagster_ on the _automation_ tab, start the following sensors: *
    - bronze_collection_partition_sync
    - gold_dcs_collection_rollup_trigger
    - item_queue
    - process_item_failure
1. Then run the `bronze_preservica_import_collection` job, with `ref` and `collection` set in the launchpad to the collection folder name in preservica, ie "haeger". This will import the collection and items into the bronze cask folder, and builds the tree structure for the items. Example launchpad:
    ```
    ops:
        preservica_import_collection:
            config:
            dest_root: ""
            group: preservica
            max_depth: 1
            skip_unchanged: true
            source_dir: ""
            ref: "haeger"
            collection: "haeger"
    ```
1. Once the previous job completes, run the `gold_dcs_process_collection` job for the collection partition, ie "bronze/preservica/haeger". This will build fan-out jobs for each item, build silver derivatives, copy access/preservation binaries into gold for showcase downloads, and builds / indexes the item documents in elastic. After all items succeed/fail, a collection rollup job will be triggered (~5 - 10 minutes) that will index the collection and update the item count.
1. The collection and items should now be in the showcase app as private. You can edit 

_* Other sensors are worth enabling as well, including `bronze_collection_cask_audit` (if you want to listen to changes to the bronze tree folder and have those items show up in the showcase app) and `workspace_partition_sync` (if you want to sync workspace folders into cask during the `digtk workspace add *` command)_