FROM node:20-slim
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN rm -f package-lock.json && npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npx tsc || true

EXPOSE 8063

# Need to run db push, seed, and then start the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run prisma:seed && node dist/index.js"]
