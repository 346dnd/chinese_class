package service

import (
	"time"

	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type BadgeService struct{}

func NewBadgeService() *BadgeService {
	return &BadgeService{}
}

func (s *BadgeService) AwardBadge(req model.BadgeAwardRequest) (*model.BadgeAwardResponse, error) {
	hasBadge, err := repository.HasBadge(req.StudentId, req.BadgeName)
	if err != nil {
		return nil, err
	}

	if hasBadge {
		return &model.BadgeAwardResponse{
			Success:   false,
			BadgeName: req.BadgeName,
		}, nil
	}

	badge := &model.Badge{
		StudentId: req.StudentId,
		BadgeName: req.BadgeName,
		Condition: req.Condition,
		StageId:   nullString(req.StageId),
		AwardTime: time.Now(),
	}

	err = repository.AwardBadge(badge)
	if err != nil {
		return nil, err
	}

	return &model.BadgeAwardResponse{
		Success:     true,
		BadgeName:   req.BadgeName,
		AwardTime:   badge.AwardTime.Format("2006-01-02T15:04:05Z"),
		Condition:   req.Condition,
	}, nil
}
