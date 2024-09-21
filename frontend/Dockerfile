FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g pm2
COPY . .
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV HOST=0.0.0.0
RUN npm run build
EXPOSE 3017
CMD ["pm2-runtime", "start", "npm", "--", "start", "--", "--port", "3017"]
