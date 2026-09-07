package app

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/GrrrGe/git-who/internal/cache"
	"github.com/GrrrGe/git-who/internal/git"
	"github.com/GrrrGe/git-who/internal/output"
)

// Cached JSON entry points. Text output stays uncached; --json and the web
// UI share these so repeat views return instantly.

func fileDigest(root, name string) string {
	data, err := os.ReadFile(filepath.Join(root, name))
	if err != nil {
		return "-"
	}
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

// fingerprint ties a request to the exact objects git will read: resolved
// revision IDs plus every flag that changes the numbers.
func fingerprint(root string, view string, r Request) (string, error) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	parts := []string{"v1", view, root}
	for _, rev := range r.Revs {
		resolved, err := git.ResolveRev(ctx, rev)
		if err != nil {
			return "", err
		}
		parts = append(parts, resolved)
	}
	parts = append(parts,
		r.Mode.String(),
		fmt.Sprintf("%d", r.Limit),
		fmt.Sprintf("%t|%t|%t", r.ByEmail, r.Merges, r.Hidden),
		r.Since, r.Until,
		strings.Join(r.Paths, "\n"),
		strings.Join(r.Authors, "\n"),
		strings.Join(r.NAuthors, "\n"),
		fileDigest(root, ".mailmap"),
		fileDigest(root, ".git-blame-ignore-revs"),
	)
	return cache.Fingerprint(parts...), nil
}

func encode(v any) ([]byte, error) {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetIndent("", "  ")
	if err := enc.Encode(v); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// cached runs fresh, encodes, and stores the result under the request key.
// Cache misses, errors, and encode failures all fall back to fresh compute.
func cached(root, view string, r Request, fresh func() (any, error)) ([]byte, error) {
	if key, err := fingerprint(root, view, r); err == nil {
		if data, ok := cache.Get(key); ok {
			return data, nil
		}
		v, err := fresh()
		if err != nil {
			return nil, err
		}
		data, err := encode(v)
		if err != nil {
			return nil, err
		}
		_ = cache.Set(key, data)
		return data, nil
	}
	v, err := fresh()
	if err != nil {
		return nil, err
	}
	return encode(v)
}

// TableJSON returns the table payload, cached when the repo state matches.
func TableJSON(r Request) ([]byte, error) {
	root, err := git.Root()
	if err != nil {
		return nil, err
	}
	return cached(root, "table", r, func() (any, error) {
		authors, _, err := Table(r)
		if err != nil {
			return nil, err
		}
		return output.BuildTableJSON(authors, r.Mode), nil
	})
}

// TreeJSON returns the tree payload, cached when the repo state matches.
func TreeJSON(r Request) ([]byte, error) {
	root, err := git.Root()
	if err != nil {
		return nil, err
	}
	return cached(root, "tree", r, func() (any, error) {
		node, err := Tree(r)
		if err != nil {
			return nil, err
		}
		return output.BuildTreeJSON(node, r.Mode), nil
	})
}

// HistJSON returns the timeline payload, cached when the repo state matches.
func HistJSON(r Request) ([]byte, error) {
	root, err := git.Root()
	if err != nil {
		return nil, err
	}
	return cached(root, "hist", r, func() (any, error) {
		buckets, err := Hist(r)
		if err != nil {
			return nil, err
		}
		return output.BuildHistJSON(buckets, r.Mode), nil
	})
}
