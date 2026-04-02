FROM node:20-alpine
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV PUBLIC_URL=/

COPY package.json package-lock.json ./
RUN npm install --silent
RUN npm install react-scripts@5.0.1 -g --silent

COPY public/ public/
COPY src/ src/

EXPOSE 3000
CMD ["npm", "start"]