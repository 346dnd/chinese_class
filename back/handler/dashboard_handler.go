package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/service"
)

type DashboardHandler struct {
	dashboardService *service.DashboardService
	validator        *validator.Validate
}

func NewDashboardHandler(dashboardService *service.DashboardService) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: dashboardService,
		validator:        validator.New(),
	}
}

func (h *DashboardHandler) GetData(c *gin.Context) {
	teacherId := c.GetHeader("X-Teacher-Id")
	if teacherId == "" {
		response.JSONError(c, response.CodeUnauthorized, "未授权")
		return
	}

	data, err := h.dashboardService.GetData(teacherId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, data)
}

func (h *DashboardHandler) GetFilteredData(c *gin.Context) {
	teacherId := c.GetHeader("X-Teacher-Id")
	if teacherId == "" {
		response.JSONError(c, response.CodeUnauthorized, "未授权")
		return
	}

	var req model.DashboardFilterRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	data, err := h.dashboardService.GetFilteredData(req, teacherId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}
	response.JSONSuccess(c, data)
}

func (h *DashboardHandler) Export(c *gin.Context) {
	teacherId := c.GetHeader("X-Teacher-Id")
	if teacherId == "" {
		response.JSONError(c, response.CodeUnauthorized, "未授权")
		return
	}

	var req model.DashboardExportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "请求参数错误")
		return
	}

	if err := h.validator.Struct(req); err != nil {
		response.JSONError(c, response.CodeInvalidParams, "缺少必填字段")
		return
	}

	data, filename, err := h.dashboardService.ExportData(req, teacherId)
	if err != nil {
		response.JSONError(c, response.CodeInternalError, err.Error())
		return
	}

	contentType := "text/csv"
	if req.Format == "excel" {
		contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	}

	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Status(http.StatusOK)
	c.Writer.Write(data)
}
