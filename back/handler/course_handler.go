package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/pkg/response"
	"github.com/edu-chinese-classroom/service"
)

type CourseHandler struct {
	courseService *service.CourseService
}

func NewCourseHandler(courseService *service.CourseService) *CourseHandler {
	return &CourseHandler{courseService: courseService}
}

func (h *CourseHandler) GetCourse(c *gin.Context) {
	course, err := h.courseService.GetCourse()
	if err != nil {
		response.JSONError(c, response.CodeDatabaseError, err.Error())
		return
	}
	response.JSONSuccess(c, course)
}

func (h *CourseHandler) GetStage(c *gin.Context) {
	stageId := c.Param("stageId")
	studentId := c.GetHeader("X-Student-Id")

	if studentId == "" {
		response.JSONError(c, response.CodeInvalidParams, "缺少学生ID")
		return
	}

	stage, err := h.courseService.GetStage(stageId, studentId)
	if err != nil {
		response.JSONError(c, response.CodeDatabaseError, err.Error())
		return
	}
	response.JSONSuccess(c, stage)
}
