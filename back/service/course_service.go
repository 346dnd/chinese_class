package service

import (
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type CourseService struct{}

func NewCourseService() *CourseService {
	return &CourseService{}
}

func (s *CourseService) GetCourse() (*model.CourseResponse, error) {
	return &model.CourseResponse{
		ID:    "hua",
		Title: "一幅名扬中外的画",
		Stages: []model.StageBrief{
			{ID: "preview", Name: "寻找文化", Order: 1, TaskCount: 3},
			{ID: "warmup", Name: "重温文化", Order: 2, TaskCount: 1},
			{ID: "method", Name: "宣传有法", Order: 3, TaskCount: 2},
			{ID: "creation", Name: "宣传文化", Order: 4, TaskCount: 1},
			{ID: "homework", Name: "传承文化", Order: 5, TaskCount: 1},
		},
	}, nil
}

func (s *CourseService) GetStage(stageId, studentId string) (*model.StageResponse, error) {
	progress, err := repository.GetProgress(studentId, stageId)
	if err != nil {
		return nil, err
	}

	if progress == nil {
		progress = &model.Progress{
			StudentId:        studentId,
			StageId:          stageId,
			CurrentTaskIndex: 0,
			CompletedTaskIds: []string{},
			Status:           "in_progress",
		}
		err := repository.CreateProgress(progress)
		if err != nil {
			return nil, err
		}
	}

	tasks := s.getStageTasks(stageId)

	return &model.StageResponse{
		ID: stageId,
		Name: s.getStageName(stageId),
		Order: s.getStageOrder(stageId),
		Progress: model.ProgressInfo{
			CurrentTaskIndex: progress.CurrentTaskIndex,
			CompletedTaskIds: progress.CompletedTaskIds,
		},
		Tasks: tasks,
	}, nil
}

func (s *CourseService) getStageName(stageId string) string {
	names := map[string]string{
		"preview":  "寻找文化",
		"warmup":   "重温文化",
		"method":   "宣传有法",
		"creation": "宣传文化",
		"homework": "传承文化",
	}
	return names[stageId]
}

func (s *CourseService) getStageOrder(stageId string) int {
	orders := map[string]int{
		"preview":  1,
		"warmup":   2,
		"method":   3,
		"creation": 4,
		"homework": 5,
	}
	return orders[stageId]
}

func (s *CourseService) getStageTasks(stageId string) []model.TaskConfig {
	switch stageId {
	case "preview":
		return []model.TaskConfig{
			{
				ID:                 "write-thought",
				Type:               "write-thought",
				Title:              "写写感想",
				DigitalHumanPrompt: "请同学们翻到第11课...",
				Texts: []model.TextConfig{
					{
						ID:         "text-paper",
						Title:      "《纸的发明》",
						Prompt:     "读完这篇课文...",
						MinLength:  20,
						MaxLength:  200,
						AllowPhoto: true,
					},
					{
						ID:         "text-zhaozhouqiao",
						Title:      "《赵州桥》",
						Prompt:     "读完这篇课文...",
						MinLength:  20,
						MaxLength:  200,
						AllowPhoto: true,
					},
					{
						ID:         "text-qingming",
						Title:      "《一幅名扬中外的画》",
						Prompt:     "读完这篇课文...",
						MinLength:  20,
						MaxLength:  200,
						AllowPhoto: true,
					},
				},
				Retry: model.RetryConfig{
					MaxRetries:  3,
					OnExhausted: "reveal_and_end",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
			{
				ID:                 "ask-question",
				Type:               "ask-question",
				Title:              "提出问题",
				DigitalHumanPrompt: "你一定有很多启发吧...",
				MinQuestions:       1,
				Retry: model.RetryConfig{
					MaxRetries:  3,
					OnExhausted: "reveal_and_end",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
			{
				ID:                 "fill-blank",
				Type:               "fill-blank",
				Title:              "初步感悟",
				DigitalHumanPrompt: "点击空格...",
				Texts: []model.TextConfig{
					{
						ID:    "text-zhaozhouqiao",
						Title: "《赵州桥》",
						Blanks: []model.BlankConfig{
							{ID: "blank-1", CorrectAnswer: "美观", Context: "围绕一个意思把一段话写清楚，一个意思指的是____"},
						},
					},
				},
				Retry: model.RetryConfig{
					MaxRetries:  2,
					OnExhausted: "reveal_answer",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
		}
	case "warmup":
		return []model.TaskConfig{
			{
				ID:                 "review-game",
				Type:               "review-game",
				Title:              "重温文化",
				DigitalHumanPrompt: "我们以做游戏的方式重温赵州桥的巧妙设计...",
				Retry: model.RetryConfig{
					MaxRetries:  2,
					OnExhausted: "reveal_and_end",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
		}
	case "method":
		return []model.TaskConfig{
			{
				ID:                 "method-zhaozhouqiao",
				Type:               "practice",
				Title:              "方法练习-赵州桥",
				DigitalHumanPrompt: "我们来梳理表达方法...",
				Retry: model.RetryConfig{
					MaxRetries:  2,
					OnExhausted: "reveal_answer",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
			{
				ID:                 "method-qingming",
				Type:               "practice",
				Title:              "方法练习-清明上河图",
				DigitalHumanPrompt: "根据表达方法去挑战任务...",
				Retry: model.RetryConfig{
					MaxRetries:  2,
					OnExhausted: "reveal_answer",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
		}
	case "creation":
		return []model.TaskConfig{
			{
				ID:                 "creation",
				Type:               "creation",
				Title:              "宣传文化",
				DigitalHumanPrompt: "请向外国小朋友宣传中华优秀传统文化...",
				Retry: model.RetryConfig{
					MaxRetries:  3,
					OnExhausted: "reveal_and_end",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
		}
	case "homework":
		return []model.TaskConfig{
			{
				ID:                 "homework",
				Type:               "homework",
				Title:              "传承文化",
				DigitalHumanPrompt: "请完成分层作业...",
				Retry: model.RetryConfig{
					MaxRetries:  2,
					OnExhausted: "reveal_and_end",
				},
				FeedbackOverlay: model.FeedbackOverlayConfig{Forced: true},
			},
		}
	default:
		return []model.TaskConfig{}
	}
}
