package storage

import (
	"errors"
	"fmt"

	"github.com/edu-chinese-classroom/config"
)

type Storage interface {
	UploadFile(key string, file []byte, contentType string) (string, error)
	DownloadFile(key string) ([]byte, error)
	DeleteFile(key string) error
	GetFileURL(key string) (string, error)
	FileExists(key string) (bool, error)
}

func NewStorage(cfg *config.StorageConfig) (Storage, error) {
	switch cfg.Provider {
	case "oss":
		return NewOSSStorage(cfg)
	case "cos":
		return NewCOSStorage(cfg)
	case "local":
		return NewLocalStorage(cfg)
	default:
		return nil, errors.New(fmt.Sprintf("unsupported storage provider: %s", cfg.Provider))
	}
}
