#! /bin/bash

# Initialize a production dc-showcase environment. Baked into the dcs-client
# image (on PATH as `dcs-prod-init`) and meant to be run as a k8s Job, see
# dc-showcase-deployment's kustomize/init and cmds/prod-init.sh. Every step is
# safe to re-run.
#
# Run after argonath's own prod init (argonath-deployment's cmds/prod-init.sh),
# which creates the dcf database, the cask tables and the cask admin role for
# the user this runs as.
#
# Expected env (all provided by the init Job):
#   PG_HOST, PG_DATABASE, PG_PASSWORD  - the app's dcf database
#   CASK_URL, CASK_PATH_PREFIX         - cask service
#   CASK_USER                          - cask user with write access to
#                                        CASK_GOLD_BASE_PATH
#   CASK_GOLD_BASE_PATH                - the app's gold project
#   ES_HOST, ES_PORT                   - the app's elasticsearch

set -e

ROOT_DIR="$( cd "$( dirname "$(readlink -f "${BASH_SOURCE[0]}")" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR/..

echo "Initializing dc-showcase (pg: $PG_HOST/$PG_DATABASE, cask: $CASK_URL as $CASK_USER, es: $ES_HOST:$ES_PORT)"

# install the app's dcf schema (init/postgres/*.sql). Safe to re-run.
echo "Applying init sql"
node bin/init-db.js

# copy the gold seed files (hero banner, browse by images) into the app's
# gold project. Existing files are kept. Safe to re-run.
echo "Seeding cask gold files: $CASK_GOLD_BASE_PATH"
node bin/init-cask.js

# create the ES indices and <model>-read/-write aliases. Done here, not at
# app startup, so dcs-client replicas can't race and each create an index.
# Existing aliases are kept. Safe to re-run.
echo "Initializing elasticsearch indices: $ES_HOST:$ES_PORT"
node bin/init-es.js

echo "Done initializing dc-showcase"
