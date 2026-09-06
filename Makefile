VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo dev)
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo unknown)
LDFLAGS := -s -w -X main.version=$(VERSION) -X main.commit=$(COMMIT)

BIN := git-who

.PHONY: build test vet clean

build:
	go build -ldflags '$(LDFLAGS)' -o $(BIN) .

test:
	go test ./...

vet:
	go vet ./...

clean:
	rm -f $(BIN)
