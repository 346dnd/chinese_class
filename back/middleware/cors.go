package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/edu-chinese-classroom/config"
)

func CORSMiddleware(cfg *config.CORSConfig) gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     cfg.AllowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "X-Student-Id", "X-Teacher-Id", "X-Trace-Id", "Authorization"},
		ExposeHeaders:    []string{"X-Trace-Id"},
		AllowCredentials: true,
	})
}
