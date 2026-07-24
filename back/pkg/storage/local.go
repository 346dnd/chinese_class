package storage

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/edu-chinese-classroom/config"
)

type LocalStorage struct {
	basePath string
}

func NewLocalStorage(cfg *config.StorageConfig) (*LocalStorage, error) {
	basePath := cfg.LocalPath
	if basePath == "" {
		basePath = "./uploads"
	}
	
	err := os.MkdirAll(basePath, os.ModePerm)
	if err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	return &LocalStorage{
		basePath: basePath,
	}, nil
}

func (s *LocalStorage) UploadFile(key string, file []byte, contentType string) (string, error) {
	filePath := filepath.Join(s.basePath, key)
	
	err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm)
	if err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}

	err = os.WriteFile(filePath, file, 0644)
	if err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return fmt.Sprintf("/uploads/%s", key), nil
}

func (s *LocalStorage) DownloadFile(key string) ([]byte, error) {
	filePath := filepath.Join(s.basePath, key)
	return os.ReadFile(filePath)
}

func (s *LocalStorage) DeleteFile(key string) error {
	filePath := filepath.Join(s.basePath, key)
	return os.Remove(filePath)
}

func (s *LocalStorage) GetFileURL(key string) (string, error) {
	return fmt.Sprintf("/uploads/%s", key), nil
}

func (s *LocalStorage) FileExists(key string) (bool, error) {
	filePath := filepath.Join(s.basePath, key)
	_, err := os.Stat(filePath)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}
