package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/pkg/utils"
	"github.com/edu-chinese-classroom/service"
)

type WriteHandler struct {
	writeService *service.WriteService
	validator    *validator.Validate
}

func NewWriteHandler(writeService *service.WriteService) *WriteHandler {
	return &WriteHandler{
		writeService: writeService,
		validator:    validator.New(),
	}
}

func (h *WriteHandler) SubmitThought(c *gin.Context) {
	studentId := c.GetHeader("X-Student-Id")
	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	var req model.WriteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	if utils.ContainsSensitiveContent(req.Content) {
		response.JSONError(c, response.CodeSensitiveContent, "请输入文明用语")
		return
	}

	resp, err := h.writeService.SubmitThought(req, studentId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}
