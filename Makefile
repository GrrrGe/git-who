VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo unknown)
LDFLAGS := -s -w -X main.version=$(VERSION) -X main.commit=$(COMMIT)

BIN := git-who
PREFIX ?= $(shell go env GOPATH)/bin

.PHONY: build install test vet bench clean

build:
	go build -ldflags '$(LDFLAGS)' -o $(BIN) .

install: build
	cp $(BIN) $(PREFIX)/$(BIN)

bench: build
	go test -run=NONE -bench=. -benchtime=10x ./internal/git/
	./scripts/bench.sh "$${REPO:-.}" 7 -- table --json -n 0

test:
	go test ./...

vet:
	go vet ./...

clean:
	rm -f $(BIN)
