FROM node:16-alpine

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

# Bundle app source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]