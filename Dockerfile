FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .


RUN mkdir -p public && cp index.html style.css script.js public/

EXPOSE 5000

CMD ["node", "server.js"]