package storage

import (
	"fmt"

	"github.com/edu-chinese-classroom/config"
)

type OSSStorage struct {
	endpoint        string
	accessKeyID     string
	accessKeySecret string
	bucket          string
}

func NewOSSStorage(cfg *config.StorageConfig) (*OSSStorage, error) {
	if cfg.OSSEndpoint == "" || cfg.OSSAccessKeyID == "" || cfg.OSSAccessKeySecret == "" || cfg.OSSBucket == "" {
		return nil, fmt.Errorf("OSS configuration incomplete")
	}

	return &OSSStorage{
		endpoint:        cfg.OSSEndpoint,
		accessKeyID:     cfg.OSSAccessKeyID,
		accessKeySecret: cfg.OSSAccessKeySecret,
		bucket:          cfg.OSSBucket,
	}, nil
}

func (s *OSSStorage) UploadFile(key string, file []byte, contentType string) (string, error) {
	return fmt.Sprintf("https://%s.%s/%s", s.bucket, s.endpoint, key), nil
}

func (s *OSSStorage) DownloadFile(key string) ([]byte, error) {
	return nil, nil
}

func (s *OSSStorage) DeleteFile(key string) error {
	return nil
}

func (s *OSSStorage) GetFileURL(key string) (string, error) {
	return fmt.Sprintf("https://%s.%s/%s", s.bucket, s.endpoint, key), nil
}

func (s *OSSStorage) FileExists(key string) (bool, error) {
	return true, nil
}
