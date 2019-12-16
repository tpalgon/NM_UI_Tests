FROM node:10.16.0
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD npm run test
EXPOSE 8081
