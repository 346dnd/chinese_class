package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/edu-chinese-classroom/config"
	"github.com/edu-chinese-classroom/pkg/response"
)

type rateLimiter struct {
	mu         sync.Mutex
	clients    map[string]*clientState
	rate       int
	burst      int
	windowSize time.Duration
}

type clientState struct {
	tokens     int
	lastUpdate time.Time
}

func NewRateLimiter(cfg *config.RateLimitConfig) *rateLimiter {
	return &rateLimiter{
		clients:    make(map[string]*clientState),
		rate:       cfg.RequestsPerSecond,
		burst:      cfg.Burst,
		windowSize: time.Second,
	}
}

func (rl *rateLimiter) Allow(clientIP string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	state, exists := rl.clients[clientIP]
	if !exists {
		state = &clientState{
			tokens:     rl.burst,
			lastUpdate: time.Now(),
		}
		rl.clients[clientIP] = state
	}

	now := time.Now()
	elapsed := now.Sub(state.lastUpdate)
	tokensToAdd := int(elapsed.Seconds()) * rl.rate

	if tokensToAdd > 0 {
		state.tokens = min(state.tokens+tokensToAdd, rl.burst)
		state.lastUpdate = now
	}

	if state.tokens > 0 {
		state.tokens--
		return true
	}

	return false
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func RateLimitMiddleware(cfg *config.RateLimitConfig) gin.HandlerFunc {
	rl := NewRateLimiter(cfg)
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		if !rl.Allow(clientIP) {
			response.JSONError(c, response.CodeRateLimited, "请求过于频繁")
			c.Abort()
			return
		}
		c.Next()
	}
}
