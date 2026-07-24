package service

import (
	"fmt"
	"mime"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/storage"
)

type MediaService struct {
	storage storage.Storage
}

func NewMediaService(storage storage.Storage) *MediaService {
	return &MediaService{storage: storage}
}

func (s *MediaService) UploadFile(file []byte, filename string) (*model.MediaUploadResponse, error) {
	ext := filepath.Ext(filename)
	contentType := mime.TypeByExtension(ext)

	key := "uploads/" + uuid.New().String()[:8] + ext

	url, err := s.storage.UploadFile(key, file, contentType)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}

	return &model.MediaUploadResponse{
		URL: url,
	}, nil
}
