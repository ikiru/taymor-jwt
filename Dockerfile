FROM node:8.9.4
RUN mkdir -p /var/app
WORKDIR /var/app
COPY package.json /var/app/
RUN npm install
COPY . /var/app
EXPOSE 9005
CMD ["sh", "-c", "node app.js"]
