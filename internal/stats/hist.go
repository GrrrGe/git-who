package stats

import (
	"sort"
	"time"

	"github.com/GrrrGe/git-who/internal/git"
)

// Bucket covers one calendar period. Winner leads it; Total spans everyone.
type Bucket struct {
	Label  string
	Start  time.Time
	Winner *Author
	Total  *Author
}

// WinnerValue is the winner's number in the mode; TotalValue is the period's.
func (b *Bucket) WinnerValue(m Mode) int {
	if b.Winner == nil {
		return 0
	}
	return int(b.Winner.Value(m))
}

// TotalValue is the whole period's number in the mode.
func (b *Bucket) TotalValue(m Mode) int {
	if b.Total == nil {
		return 0
	}
	return int(b.Total.Value(m))
}

// Timeline groups commits into a dense series of daily buckets, then widens
// them to months or years for long histories.
func Timeline(
	commits <-chan git.Commit,
	key func(git.Commit) string,
	countMerges bool,
	ignore map[string]bool,
	end time.Time,
	m Mode,
) []*Bucket {
	daily := map[time.Time]map[string]*accumulator{}
	var first, last time.Time

	for c := range commits {
		if ignore[c.Hash] {
			continue
		}
		if c.Merge && !countMerges {
			continue
		}
		day := time.Date(c.Date.Year(), c.Date.Month(), c.Date.Day(), 0, 0, 0, 0, time.Local)
		if first.IsZero() || day.Before(first) {
			first = day
		}
		if day.After(last) {
			last = day
		}
		slot, found := daily[day]
		if !found {
			slot = map[string]*accumulator{}
			daily[day] = slot
		}
		k := key(c)
		acc, found := slot[k]
		if !found {
			acc = newAccumulator(c)
			slot[k] = acc
		}
		// Timeline buckets count commits and line/file volume; merge
		// commits never contribute volume.
		acc.commits[c.Hash] = true
		if c.Date.Before(acc.first) || acc.first.IsZero() {
			acc.first = c.Date
		}
		if c.Date.After(acc.last) {
			acc.last = c.Date
		}
		slot[k] = acc
		if c.Merge {
			continue
		}
		for _, f := range c.Files {
			acc.files[f.Path] = true
			acc.added += f.Added
			acc.removed += f.Removed
		}
	}

	if len(daily) == 0 {
		return nil
	}
	if end.IsZero() {
		end = last
	}

	span := end.Sub(first)
	const day = 24 * time.Hour
	var width func(time.Time) (time.Time, string)
	switch {
	case span > 5*365*day:
		width = func(t time.Time) (time.Time, string) {
			s := time.Date(t.Year(), 1, 1, 0, 0, 0, 0, time.Local)
			return s, s.Format("2006")
		}
	case span > 60*day:
		width = func(t time.Time) (time.Time, string) {
			s := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.Local)
			return s, s.Format("Jan 2006")
		}
	default:
		width = func(t time.Time) (time.Time, string) {
			s := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local)
			return s, s.Format("2006-01-02")
		}
	}

	merged := map[time.Time]map[string]*accumulator{}
	var starts []time.Time
	seen := map[time.Time]bool{}
	// Dense series first so empty periods still appear.
	for t := first; !t.After(last); t = t.AddDate(0, 0, 1) {
		s, _ := width(t)
		if !seen[s] {
			seen[s] = true
			starts = append(starts, s)
		}
	}
	// Extend to the end date (e.g. "now" for active histories).
	for {
		s, _ := width(end)
		found := false
		for _, x := range starts {
			if x.Equal(s) {
				found = true
			}
		}
		if found {
			break
		}
		starts = append(starts, s)
		break
	}
	sort.Slice(starts, func(i, j int) bool { return starts[i].Before(starts[j]) })

	for day, slot := range daily {
		s, _ := width(day)
		dst, found := merged[s]
		if !found {
			dst = map[string]*accumulator{}
			merged[s] = dst
		}
		for k, acc := range slot {
			if cur, found := dst[k]; found {
				dst[k] = mergeAccumulators(cur, acc)
			} else {
				dst[k] = acc
			}
		}
	}

	out := make([]*Bucket, 0, len(starts))
	for _, s := range starts {
		_, label := width(s)
		slot := merged[s]
		authors := make([]*Author, 0, len(slot))
		for _, acc := range slot {
			authors = append(authors, acc.finish())
		}
		b := &Bucket{Label: label, Start: s, Winner: &Author{}, Total: &Author{}}
		if len(authors) > 0 {
			Sort(authors, m)
			b.Winner = authors[0]
			combo := &accumulator{commits: map[string]bool{}, files: map[string]bool{}}
			for _, acc := range slot {
				combo = mergeAccumulators(combo, acc)
			}
			b.Total = combo.finish()
		}
		out = append(out, b)
	}
	return out
}
