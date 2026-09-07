// Package cache stores computed JSON results on disk.
//
// Entries key by repository plus fully resolved revisions, so new commits
// automatically miss and recompute. Callers build the key with Fingerprint.
package cache

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Dir returns the result-cache directory, creating it on demand.
func Dir() (string, error) {
	base := os.Getenv("XDG_CACHE_HOME")
	if base == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		base = filepath.Join(home, ".cache")
	}
	dir := filepath.Join(base, "git-who", "results")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	return dir, nil
}

// Fingerprint hashes arbitrary key parts into a filename-safe key.
func Fingerprint(parts ...string) string {
	sum := sha256.Sum256([]byte(strings.Join(parts, "\x00")))
	return hex.EncodeToString(sum[:])
}

// Get reads a cached entry. The second return is false on any miss.
func Get(key string) ([]byte, bool) {
	dir, err := Dir()
	if err != nil {
		return nil, false
	}
	data, err := os.ReadFile(filepath.Join(dir, key+".json"))
	if err != nil {
		return nil, false
	}
	return data, true
}

// Set writes an entry atomically. Errors are returned but callers may
// treat the cache as best-effort and ignore them.
func Set(key string, data []byte) error {
	dir, err := Dir()
	if err != nil {
		return err
	}
	tmp, err := os.CreateTemp(dir, "tmp-*.json")
	if err != nil {
		return fmt.Errorf("cache write: %w", err)
	}
	tmpName := tmp.Name()
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		return err
	}
	if err := tmp.Close(); err != nil {
		os.Remove(tmpName)
		return err
	}
	if err := os.Rename(tmpName, filepath.Join(dir, key+".json")); err != nil {
		os.Remove(tmpName)
		return err
	}
	return nil
}
