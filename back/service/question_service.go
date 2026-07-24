package service

import (
	"github.com/edu-chinese-classroom/agent"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type QuestionService struct {
	coze *agent.CozeAgent
}

func NewQuestionService(coze *agent.CozeAgent) *QuestionService {
	return &QuestionService{coze: coze}
}

func (s *QuestionService) SubmitQuestion(req model.QuestionRequest, studentId string) (*model.QuestionResponse, error) {
	isRelated := true
	if len(req.Keywords) == 0 {
		isRelated = false
	}

	question := &model.Question{
		StudentId: studentId,
		StageId:   req.StageId,
		TaskId:    req.TaskId,
		Content:   req.Content,
		Keywords:  req.Keywords,
		IsRelated: isRelated,
		Passed:    isRelated,
	}

	err := repository.CreateQuestion(question)
	if err != nil {
		return nil, err
	}

	cozeResp, err := s.coze.Chat(agent.CozeRequest{
		StageId:   req.StageId,
		TaskId:    req.TaskId,
		Message:   req.Content,
		StudentId: studentId,
	})
	if err != nil {
		return nil, err
	}

	feedback := cozeResp.Reply
	if !isRelated {
		feedback = "你的问题跟课文内容没有关系，你可以从课文内容去思考"
	}

	err = repository.UpdateQuestionFeedback(question.ID, feedback, isRelated)
	if err != nil {
		return nil, err
	}

	relatedKeywords := []string{"造纸术起源", "蔡伦", "改进造纸术原因", "赵州桥拱形设计", "创造力", "石栏雕刻"}

	return &model.QuestionResponse{
		Passed:          isRelated,
		Feedback:        feedback,
		RetryCount:      cozeResp.RetryCount,
		RetryExhausted:  cozeResp.RetryExhausted,
		RelatedKeywords: relatedKeywords,
	}, nil
}
