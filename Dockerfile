FROM node:22.12.0-alpine3.21 as base

RUN apk add --no-cache gcompat  # install shared library for build. node:alpine does not has shared library.
RUN apk add openssl             # install libssl for prisma.


FROM base as deps

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile


FROM base as builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn prisma generate
RUN yarn build


FROM base as runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY ./initial_database.sqlite ./database.sqlite

CMD ["node", "dist/index.js"]
