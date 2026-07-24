package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/pkg/utils"
	"github.com/edu-chinese-classroom/service"
)

type GroupHandler struct {
	groupService *service.GroupService
	validator    *validator.Validate
}

func NewGroupHandler(groupService *service.GroupService) *GroupHandler {
	return &GroupHandler{
		groupService: groupService,
		validator:    validator.New(),
	}
}

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	studentId := c.GetHeader("X-Student-Id")
	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	var req model.GroupCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	resp, err := h.groupService.CreateGroup(req, studentId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}

func (h *GroupHandler) SendMessage(c *gin.Context) {
	studentId := c.GetHeader("X-Student-Id")
	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	var req model.MessageSendRequest
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

	resp, err := h.groupService.SendMessage(req, studentId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}

func (h *GroupHandler) GetMessages(c *gin.Context) {
	var req model.MessageListRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	resp, err := h.groupService.GetMessages(req)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}
