FROM node:6.11.3
RUN mkdir -p /var/app
WORKDIR /var/app
COPY package.json /var/app/
RUN npm install
COPY . /var/app
EXPOSE 9005
CMD ["sh", "-c", "node app.js"]
