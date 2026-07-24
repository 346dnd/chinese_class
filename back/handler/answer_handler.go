package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/service"
)

type AnswerHandler struct {
	answerService *service.AnswerService
	validator     *validator.Validate
}

func NewAnswerHandler(answerService *service.AnswerService) *AnswerHandler {
	return &AnswerHandler{
		answerService: answerService,
		validator:     validator.New(),
	}
}

func (h *AnswerHandler) ValidateBlank(c *gin.Context) {
	studentId := c.GetHeader("X-Student-Id")
	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	var req model.ValidateBlankRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	resp, err := h.answerService.ValidateBlank(req, studentId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}
