package handler

import (
	"io/ioutil"

	"github.com/gin-gonic/gin"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/service"
)

type MediaHandler struct {
	mediaService *service.MediaService
}

func NewMediaHandler(mediaService *service.MediaService) *MediaHandler {
	return &MediaHandler{mediaService: mediaService}
}

func (h *MediaHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少文件")
		return
	}

	fileContent, err := file.Open()
	if err != nil {
		response.JSONError(c, response.CodeStorageError, "文件打开失败")
		return
	}
	defer fileContent.Close()

	bytes, err := ioutil.ReadAll(fileContent)
	if err != nil {
		response.JSONError(c, response.CodeStorageError, "文件读取失败")
		return
	}

	if len(bytes) > 10*1024*1024 {
		response.JSONError(c, response.CodeInvalidParams, "文件大小超过10MB")
		return
	}

	resp, err := h.mediaService.UploadFile(bytes, file.Filename)
	if err != nil {
		response.JSONError(c, response.CodeStorageError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}
