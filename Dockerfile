FROM node:16-alpine

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies and nodemon globally
RUN npm install && \
    npm install -g nodemon && \
    npm install --save tencentcloud-sdk-nodejs@latest

# Copy the rest of the frontend code
COPY frontend/ .

# No need for explicit .env copy since it's included in COPY frontend/ .
# The environment variables are handled by docker-compose.yml

EXPOSE 3000

CMD ["npm", "run", "dev"]