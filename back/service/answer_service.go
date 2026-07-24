package service

import (
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type AnswerService struct{}

func NewAnswerService() *AnswerService {
	return &AnswerService{}
}

func (s *AnswerService) ValidateBlank(req model.ValidateBlankRequest, studentId string) (*model.ValidateBlankResponse, error) {
	correctAnswers := map[string]string{
		"blank-1": "美观",
		"blank-2": "坚固",
		"blank-3": "热闹",
	}

	correctAnswer := correctAnswers[req.BlankId]
	isCorrect := req.Input == correctAnswer

	answer, err := repository.GetAnswerByBlank(studentId, req.TaskId, req.BlankId)
	if err != nil && err.Error() != "failed to get answer: sql: no rows in result set" {
		return nil, err
	}

	retryCount := 0
	if answer != nil {
		retryCount = answer.RetryCount + 1
	}

	exhausted := retryCount >= 2

	newAnswer := &model.Answer{
		StudentId:  studentId,
		StageId:    "preview",
		TaskId:     req.TaskId,
		TextId:     nullString(req.TextId),
		BlankId:    nullString(req.BlankId),
		Input:      req.Input,
		Correct:    isCorrect,
		RetryCount: retryCount,
	}

	err = repository.CreateAnswer(newAnswer)
	if err != nil {
		return nil, err
	}

	feedback := ""
	if !isCorrect && !exhausted {
		feedback = "请你再仔细想想，相信你一定能答对！"
	}

	revealedAnswer := ""
	if exhausted && !isCorrect {
		revealedAnswer = correctAnswer
	}

	return &model.ValidateBlankResponse{
		Correct:        isCorrect,
		Feedback:       feedback,
		RetryCount:     retryCount,
		Exhausted:      exhausted,
		RevealedAnswer: revealedAnswer,
	}, nil
}
