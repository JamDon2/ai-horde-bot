FROM node:16-alpine AS builder

WORKDIR /usr

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm install

RUN npm run build


FROM node:16-alpine

WORKDIR /usr

COPY package*.json ./

COPY --from=builder /usr/dist ./dist

RUN npm install --omit=dev

CMD ["npm", "start"]