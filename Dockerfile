FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 5001

WORKDIR /app/backend

CMD ["node", "server.js"]