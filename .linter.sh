#!/bin/bash
cd /tmp/kavia/workspace/code-generation/weatherwatch-126012-bb122099/main_container_for_weatherwatch
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

