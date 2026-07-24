package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/edu-chinese-classroom/pkg/response"
)

func StudentAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		studentId := c.GetHeader("X-Student-Id")
		if studentId == "" {
			response.JSONError(c, response.CodeUnauthorized, "请先登录")
			c.Abort()
			return
		}
		c.Set("studentId", studentId)
		c.Next()
	}
}

func TeacherAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		teacherId := c.GetHeader("X-Teacher-Id")
		if teacherId == "" {
			response.JSONError(c, response.CodeUnauthorized, "请先登录")
			c.Abort()
			return
		}
		c.Set("teacherId", teacherId)
		c.Next()
	}
}
