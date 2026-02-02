FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Railway will set PORT automatically
EXPOSE 3000

# Let Railway handle PORT injection
CMD ["node", "src/index.js"]
