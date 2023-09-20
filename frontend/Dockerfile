FROM node:18.13-alpine as builder
WORKDIR /usr/src/app
COPY package.json .
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:1.25.2-alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY --from=builder /usr/src/app/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
WORKDIR /usr/share/nginx/html
COPY ./env.sh .
COPY .env .
RUN apk add --no-cache bash
RUN chmod +x env.sh
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
