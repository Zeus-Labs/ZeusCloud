FROM node:18.13-alpine as builder
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY . .
ARG REACT_APP_API_DOMAIN
ENV REACT_APP_API_DOMAIN=$REACT_APP_API_DOMAIN
RUN yarn build

FROM nginx:1.23-alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY --from=builder /usr/src/app/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
