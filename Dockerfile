FROM golang:1.23-alpine AS build
WORKDIR /src
COPY . .
RUN go build -o /git-who .

FROM alpine:latest
COPY --from=build /git-who /usr/local/bin/git-who
WORKDIR /git
ENTRYPOINT ["git-who"]
