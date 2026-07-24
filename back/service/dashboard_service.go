package service

import (
	"github.com/edu-chinese-classroom/model"
)

type DashboardService struct{}

func NewDashboardService() *DashboardService {
	return &DashboardService{}
}

func (s *DashboardService) GetData(teacherId string) (*model.DashboardDataResponse, error) {
	return &model.DashboardDataResponse{
		Participation: model.ParticipationData{
			Total:     48,
			Completed: 45,
			Rate:      0.9375,
		},
		Correctness: model.CorrectnessData{
			Total:   200,
			Correct: 174,
			Rate:    0.87,
		},
		WordCloud: []model.WordCloudItem{
			{Word: "智慧", Count: 42},
			{Word: "创造力", Count: 38},
			{Word: "精美", Count: 35},
		},
		CreationTypes: []model.CreationTypeItem{
			{Type: "essay", Count: 21, Rate: 0.45},
			{Type: "handcraft", Count: 14, Rate: 0.30},
			{Type: "poster", Count: 7, Rate: 0.15},
		},
		PreviewData: model.PreviewData{
			TextConnection: 0.85,
			LifeConnection: 0.72,
		},
	}, nil
}

func (s *DashboardService) GetFilteredData(filter model.DashboardFilterRequest, teacherId string) (*model.DashboardDataResponse, error) {
	return s.GetData(teacherId)
}

func (s *DashboardService) ExportData(filter model.DashboardExportRequest, teacherId string) ([]byte, string, error) {
	csvContent := "学生ID,姓名,得分,完成进度\n"
	csvContent += "S2026001,张三,95,100%\n"
	csvContent += "S2026002,李四,88,80%\n"

	filename := "dashboard_export.csv"
	if filter.Format == "excel" {
		filename = "dashboard_export.xlsx"
	}

	return []byte(csvContent), filename, nil
}
