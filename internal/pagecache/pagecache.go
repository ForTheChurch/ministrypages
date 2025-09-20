package pagecache

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
)

type PageCache interface {
	GetCachedPage(url string) (string, error)
	SetCachedPage(url string, page string) error
}

type localFilePageCache struct {
	cacheDir string
	fileExt  string
}

var _ PageCache = &localFilePageCache{}

func NewPageCache(fileExt string) PageCache {
	return &localFilePageCache{cacheDir: ".page-cache", fileExt: fileExt}
}

func (c *localFilePageCache) GetCachedPage(url string) (string, error) {
	sum, err := hash(url)
	if err != nil {
		return "", err
	}

	content, err := os.ReadFile(filepath.Join(c.cacheDir, sum+"."+c.fileExt))
	if err != nil {
		if os.IsNotExist(err) {
			return "", nil
		}
		return "", err
	}
	return string(content), nil
}

func (c *localFilePageCache) SetCachedPage(url string, page string) error {
	sum, err := hash(url)
	if err != nil {
		return err
	}

	// Don't care about errors since this is just a cache
	_ = os.MkdirAll(c.cacheDir, 0755)
	_ = os.WriteFile(filepath.Join(c.cacheDir, sum+"."+c.fileExt), []byte(page), 0644)
	return nil
}

func hash(url string) (string, error) {
	hash := sha256.New()
	_, err := hash.Write([]byte(url))
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(hash.Sum(nil)), nil
}
