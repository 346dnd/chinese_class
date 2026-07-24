package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/service"
)

type BadgeHandler struct {
	badgeService *service.BadgeService
	validator    *validator.Validate
}

func NewBadgeHandler(badgeService *service.BadgeService) *BadgeHandler {
	return &BadgeHandler{
		badgeService: badgeService,
		validator:    validator.New(),
	}
}

func (h *BadgeHandler) AwardBadge(c *gin.Context) {
	var req model.BadgeAwardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	resp, err := h.badgeService.AwardBadge(req)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, resp)
}
