# Multi-stage build for Next.js App
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install


COPY . .
ENV NEXT_PUBLIC_API_URL=http://localhost:5005/api
RUN npm run build

# Runner stage
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
