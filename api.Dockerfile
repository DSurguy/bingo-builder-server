from node:16-alpine AS BUILD_IMAGE
WORKDIR /usr/src/app
COPY . .
RUN npm ci
RUN npm run compile

FROM node:16-alpine

COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/package* .
COPY keys ./keys
COPY .env .
RUN npm ci --only=production \
  && rm -r node_modules/@firebase/firestore \
  && rm -r node_modules/@firebase/firestore-compat \
  && rm -r node_modules/@firebase/firestore-types \
  && rm -r node_modules/@grpc \
  && rm node_modules/**/*.map \
  && rm node_modules/**/*.md

EXPOSE 3010
CMD ["node", "dist/index"]