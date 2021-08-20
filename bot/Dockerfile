FROM node:latest

WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "startDev"]
