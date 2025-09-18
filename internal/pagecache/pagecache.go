package pagecache

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
)

func GetCachedPage(url string) (string, error) {
	sum, err := hash(url)
	if err != nil {
		return "", err
	}

	content, err := os.ReadFile(filepath.Join(".page-cache", sum+".html"))
	if err != nil {
		if os.IsNotExist(err) {
			return "", nil
		}
		return "", err
	}
	return string(content), nil
}

func SetCachedPage(url string, page string) error {
	sum, err := hash(url)
	if err != nil {
		return err
	}

	// Don't care about errors since this is just a cache
	_ = os.MkdirAll(".page-cache", 0755)
	_ = os.WriteFile(filepath.Join(".page-cache", sum+".html"), []byte(page), 0644)
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
