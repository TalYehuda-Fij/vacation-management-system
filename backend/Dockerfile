FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx tsx src/migrate.ts && npx tsx src/seed.ts && npx tsx src/server.ts"]
