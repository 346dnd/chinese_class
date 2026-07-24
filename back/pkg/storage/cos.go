package storage

import (
	"fmt"

	"github.com/edu-chinese-classroom/config"
)

type COSStorage struct {
	secretID  string
	secretKey string
	region    string
	bucket    string
}

func NewCOSStorage(cfg *config.StorageConfig) (*COSStorage, error) {
	if cfg.COSSecretID == "" || cfg.COSSecretKey == "" || cfg.COSRegion == "" || cfg.COSBucket == "" {
		return nil, fmt.Errorf("COS configuration incomplete")
	}

	return &COSStorage{
		secretID:  cfg.COSSecretID,
		secretKey: cfg.COSSecretKey,
		region:    cfg.COSRegion,
		bucket:    cfg.COSBucket,
	}, nil
}

func (s *COSStorage) UploadFile(key string, file []byte, contentType string) (string, error) {
	return fmt.Sprintf("https://%s.cos.%s.myqcloud.com/%s", s.bucket, s.region, key), nil
}

func (s *COSStorage) DownloadFile(key string) ([]byte, error) {
	return nil, nil
}

func (s *COSStorage) DeleteFile(key string) error {
	return nil
}

func (s *COSStorage) GetFileURL(key string) (string, error) {
	return fmt.Sprintf("https://%s.cos.%s.myqcloud.com/%s", s.bucket, s.region, key), nil
}

func (s *COSStorage) FileExists(key string) (bool, error) {
	return true, nil
}
