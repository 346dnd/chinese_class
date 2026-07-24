package logger

import (
	"fmt"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/edu-chinese-classroom/config"
)

var logger *zap.Logger

func InitLogger(cfg *config.LoggingConfig) {
	writeSyncer := getLogWriter(cfg)
	encoder := getEncoder()

	var core zapcore.Core
	if cfg.Level == "debug" {
		core = zapcore.NewCore(encoder, writeSyncer, zapcore.DebugLevel)
	} else {
		core = zapcore.NewCore(encoder, writeSyncer, zapcore.InfoLevel)
	}

	logger = zap.New(core, zap.AddCaller())
	zap.ReplaceGlobals(logger)
}

func getEncoder() zapcore.Encoder {
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	return zapcore.NewJSONEncoder(encoderConfig)
}

func getLogWriter(cfg *config.LoggingConfig) zapcore.WriteSyncer {
	logFile := cfg.OutputPath
	
	err := os.MkdirAll(fmt.Sprintf("%s/logs", "."), os.ModePerm)
	if err != nil && !os.IsExist(err) {
		fmt.Printf("Failed to create log directory: %v\n", err)
	}

	lumberJackLogger := &lumberjack.Logger{
		Filename:   logFile,
		MaxSize:    cfg.MaxSize,
		MaxBackups: cfg.MaxBackups,
		MaxAge:     cfg.MaxAge,
		Compress:   true,
	}

	return zapcore.AddSync(lumberJackLogger)
}

func Info(msg string, fields ...zap.Field) {
	if logger != nil {
		logger.Info(msg, fields...)
	}
}

func Debug(msg string, fields ...zap.Field) {
	if logger != nil {
		logger.Debug(msg, fields...)
	}
}

func Warn(msg string, fields ...zap.Field) {
	if logger != nil {
		logger.Warn(msg, fields...)
	}
}

func Error(msg string, fields ...zap.Field) {
	if logger != nil {
		logger.Error(msg, fields...)
	}
}

func Fatal(msg string, fields ...zap.Field) {
	if logger != nil {
		logger.Fatal(msg, fields...)
	}
}

func WithTrace(traceId string) *zap.Logger {
	if logger != nil {
		return logger.With(zap.String("traceId", traceId))
	}
	return logger
}
