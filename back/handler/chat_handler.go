package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/pkg/utils"
	"github.com/edu-chinese-classroom/service"
)

type ChatHandler struct {
	chatService *service.ChatService
	validator   *validator.Validate
}

func NewChatHandler(chatService *service.ChatService) *ChatHandler {
	return &ChatHandler{
		chatService: chatService,
		validator:   validator.New(),
	}
}

func (h *ChatHandler) Chat(c *gin.Context) {
	studentId := c.GetHeader("X-Student-Id")
	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	var req model.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	if utils.ContainsSensitiveContent(req.Message) {
		response.JSONError(c, response.CodeSensitiveContent, "请输入文明用语")
		return
	}

	resp, err := h.chatService.Chat(req, studentId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}

func (h *ChatHandler) Polish(c *gin.Context) {
	studentId := c.GetHeader("X-Student-Id")
	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	var req model.ChatPolishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	resp, err := h.chatService.Polish(req, studentId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}

func (h *ChatHandler) Create(c *gin.Context) {
	studentId := c.GetHeader("X-Student-Id")
	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	var req model.ChatCreationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	resp, err := h.chatService.Create(req, studentId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}
