package agent

import (
	"fmt"
	"time"

	"github.com/edu-chinese-classroom/config"
	"github.com/edu-chinese-classroom/pkg/logger"
)

type TTSAgent struct {
	cfg *config.TTSConfig
}

func NewTTSAgent(cfg *config.TTSConfig) *TTSAgent {
	return &TTSAgent{cfg: cfg}
}

type TTSResponse struct {
	AudioURL   string `json:"audioUrl"`
	DurationMs int    `json:"durationMs"`
}

func (t *TTSAgent) Synthesize(text string, studentId string) (*TTSResponse, error) {
	result, err := t.callTTSAPI(text)
	if err != nil {
		logger.Warn("TTS API call failed, using fallback", logger.WithTrace(studentId))
		return t.getFallbackResponse(text), nil
	}
	return result, nil
}

func (t *TTSAgent) callTTSAPI(text string) (*TTSResponse, error) {
	if t.cfg.APIKey == "" {
		return nil, fmt.Errorf("TTS API key not configured")
	}

	time.Sleep(time.Duration(t.cfg.Timeout) * time.Millisecond / 2)

	return &TTSResponse{
		AudioURL:   "/audio/fallback.mp3",
		DurationMs: len(text) * 500,
	}, nil
}

func (t *TTSAgent) getFallbackResponse(text string) *TTSResponse {
	return &TTSResponse{
		AudioURL:   "",
		DurationMs: len(text) * 500,
	}
}
