package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/edu-chinese-classroom/agent"
	"github.com/edu-chinese-classroom/config"
	"github.com/edu-chinese-classroom/handler"
	"github.com/edu-chinese-classroom/middleware"
	"github.com/edu-chinese-classroom/pkg/logger"
	"github.com/edu-chinese-classroom/pkg/storage"
	"github.com/edu-chinese-classroom/repository"
	"github.com/edu-chinese-classroom/service"
	"github.com/edu-chinese-classroom/websocket"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Error("failed to load config", logger.WithTrace(""))
		panic(err)
	}

	logger.InitLogger(&cfg.Logging)
	logger.Info("application starting")

	err = repository.InitDB(&cfg.Database)
	if err != nil {
		logger.Error("failed to initialize database", logger.WithTrace(""))
		panic(err)
	}

	err = repository.InitRedis(&cfg.Redis)
	if err != nil {
		logger.Warn("failed to initialize redis, some features may be unavailable")
	}

	storage, err := storage.NewStorage(&cfg.Storage)
	if err != nil {
		logger.Error("failed to initialize storage", logger.WithTrace(""))
		panic(err)
	}

	cozeAgent := agent.NewCozeAgent(&cfg.Coze)
	ttsAgent := agent.NewTTSAgent(&cfg.TTS)

	courseService := service.NewCourseService()
	writeService := service.NewWriteService(cozeAgent)
	questionService := service.NewQuestionService(cozeAgent)
	answerService := service.NewAnswerService()
	practiceService := service.NewPracticeService(cozeAgent)
	chatService := service.NewChatService(cozeAgent)
	feedbackService := service.NewFeedbackService(cozeAgent, ttsAgent)
	groupService := service.NewGroupService()
	homeworkService := service.NewHomeworkService(cozeAgent)
	badgeService := service.NewBadgeService()
	dashboardService := service.NewDashboardService()
	mediaService := service.NewMediaService(storage)

	courseHandler := handler.NewCourseHandler(courseService)
	writeHandler := handler.NewWriteHandler(writeService)
	questionHandler := handler.NewQuestionHandler(questionService)
	answerHandler := handler.NewAnswerHandler(answerService)
	practiceHandler := handler.NewPracticeHandler(practiceService)
	chatHandler := handler.NewChatHandler(chatService)
	feedbackHandler := handler.NewFeedbackHandler(feedbackService)
	groupHandler := handler.NewGroupHandler(groupService)
	homeworkHandler := handler.NewHomeworkHandler(homeworkService)
	badgeHandler := handler.NewBadgeHandler(badgeService)
	dashboardHandler := handler.NewDashboardHandler(dashboardService)
	mediaHandler := handler.NewMediaHandler(mediaService)

	gin.SetMode(cfg.Server.Mode)
	r := gin.Default()

	r.Use(middleware.TraceMiddleware())
	r.Use(middleware.CORSMiddleware(&cfg.CORS))
	r.Use(middleware.RateLimitMiddleware(&cfg.RateLimit))

	r.GET("/ws", func(c *gin.Context) {
		websocket.WSHandler(c.Writer, c.Request)
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/")
	{
		api.GET("/course", courseHandler.GetCourse)
		api.GET("/stage/:stageId", courseHandler.GetStage)

		api.POST("/write", writeHandler.SubmitThought)
		api.POST("/question", questionHandler.SubmitQuestion)
		api.POST("/validate-blank", answerHandler.ValidateBlank)
		api.POST("/practice", practiceHandler.SubmitPractice)
		api.POST("/read-aloud", practiceHandler.SubmitReadAloud)
		api.POST("/chat", chatHandler.Chat)
		api.POST("/chat/polish", chatHandler.Polish)
		api.POST("/chat/creation", chatHandler.Create)
		api.POST("/feedback/generate", feedbackHandler.Generate)
		api.POST("/group/create", groupHandler.CreateGroup)
		api.POST("/message/send", groupHandler.SendMessage)
		api.POST("/message/list", groupHandler.GetMessages)
		api.POST("/homework/recommend", homeworkHandler.Recommend)
		api.POST("/homework/submit", homeworkHandler.Submit)
		api.POST("/badge/award", badgeHandler.AwardBadge)
		api.POST("/media/upload", mediaHandler.Upload)

		dashboard := api.Group("/dashboard")
		{
			dashboard.GET("/data", dashboardHandler.GetData)
			dashboard.GET("/data/filter", dashboardHandler.GetFilteredData)
			dashboard.GET("/export", dashboardHandler.Export)
		}
	}

	logger.Info("server starting on port " + cfg.Server.Port)
	err = r.Run(":" + cfg.Server.Port)
	if err != nil {
		logger.Error("failed to start server", logger.WithTrace(""))
		panic(err)
	}
}
