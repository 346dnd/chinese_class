package utils

import (
	"github.com/google/uuid"
)

func GenerateTraceId() string {
	return uuid.New().String()
}

func ExtractTraceIdFromRequest(headers map[string][]string) string {
	if traceIds, ok := headers["X-Trace-Id"]; ok && len(traceIds) > 0 {
		return traceIds[0]
	}
	if traceIds, ok := headers["X-Request-Id"]; ok && len(traceIds) > 0 {
		return traceIds[0]
	}
	return GenerateTraceId()
}
