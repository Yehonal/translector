#!/usr/bin/env bash

set -e

ROOT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/"

source "$ROOT_PATH/apps/git-utils/subrepo.sh"

echo "> Pulling and update all subrepos"

subrepoUpdate https://gitlab.com/hw-core/modules/reactstrap-modals/ master src/deps/@hw-core/reactstrap-modals

subrepoUpdate https://github.com/yehonal/sequelize-graphql-schema develop src/deps/sequelize-graphql-schema/

subrepoUpdate https://gitlab.com/hw-core/node-platform master src/deps/@hw-core/node-platform
