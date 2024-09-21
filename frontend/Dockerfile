FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g serve
COPY . .
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build
EXPOSE 3017
CMD ["serve", "-s", "build", "-l", "3017"]
