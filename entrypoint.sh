#!/bin/sh

# Replace template with actual env vars
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Start Nginx
nginx -g 'daemon off;'