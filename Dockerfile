FROM node
EXPOSE 3000
WORKDIR /usr/src/app

COPY . .

RUN npm install --production

CMD npm start