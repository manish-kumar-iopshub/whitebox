# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# --- Nginx Stage ---
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy env template and entrypoint script
COPY env.template.js /usr/share/nginx/html/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Replace Nginx config if you want custom port (e.g. 3000)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
CMD ["/entrypoint.sh"]
