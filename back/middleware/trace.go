package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/edu-chinese-classroom/pkg/utils"
)

func TraceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		traceId := c.GetHeader("X-Trace-Id")
		if traceId == "" {
			traceId = utils.GenerateTraceId()
		}
		c.Set("traceId", traceId)
		c.Writer.Header().Set("X-Trace-Id", traceId)
		c.Next()
	}
}
