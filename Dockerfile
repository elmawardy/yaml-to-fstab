FROM node:14 AS build
COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3030
CMD ["node","index.js"]