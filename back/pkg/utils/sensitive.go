package utils

import (
	"regexp"
	"strings"
)

var sensitiveWords = []string{
	"敏感词1",
	"敏感词2",
	"敏感词3",
}

var sensitiveRegex = regexp.MustCompile(strings.Join(sensitiveWords, "|"))

func ContainsSensitiveContent(text string) bool {
	if text == "" {
		return false
	}
	return sensitiveRegex.MatchString(text)
}

func FilterSensitiveContent(text string) string {
	if text == "" {
		return ""
	}
	return sensitiveRegex.ReplaceAllString(text, "***")
}
