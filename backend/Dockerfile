# syntax=docker/dockerfile:1
FROM golang:1.19-alpine as builder
ENV GO111MODULE=on \
    CGO_ENABLED=0
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o /main

FROM alpine:3.14
COPY --from=builder /main /main
CMD [ "/main" ]
EXPOSE 8080
