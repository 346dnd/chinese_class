package service

import (
	"github.com/edu-chinese-classroom/agent"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type HomeworkService struct {
	coze *agent.CozeAgent
}

func NewHomeworkService(coze *agent.CozeAgent) *HomeworkService {
	return &HomeworkService{coze: coze}
}

func (s *HomeworkService) Recommend(req model.HomeworkRecommendRequest, studentId string) (*model.HomeworkRecommendResponse, error) {
	return &model.HomeworkRecommendResponse{
		Level:          "advanced",
		Title:          "向外国小朋友宣传春节",
		RequiredTask:   "写一段话，围绕一个意思把一段话写清楚",
		OptionalTasks:  []string{"手抄报", "海报", "诗歌", "小剧本"},
		ScoreThreshold: 80,
	}, nil
}

func (s *HomeworkService) Submit(req model.HomeworkSubmitRequest, studentId string) (*model.PracticeResponse, error) {
	homework := &model.Homework{
		StudentId:     studentId,
		StageId:       req.StageId,
		TaskId:        req.TaskId,
		Content:       req.Content,
		CreationType:  req.CreationType,
		ImageUrl:      req.ImageUrl,
		Passed:        false,
	}

	err := repository.CreateHomework(homework)
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

	passed := len(req.Content) >= 50

	return &model.PracticeResponse{
		Passed:          passed,
		Feedback:        cozeResp.Reply,
		RetryCount:      cozeResp.RetryCount,
		RetryExhausted:  cozeResp.RetryExhausted,
	}, nil
}
