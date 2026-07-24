package model

type WriteRequest struct {
	StageId        string  `json:"stageId" validate:"required"`
	TaskId         string  `json:"taskId" validate:"required"`
	TextId         string  `json:"textId" validate:"required"`
	Content        string  `json:"content" validate:"required"`
	ProudAspect    string  `json:"proudAspect"`
	TextConnection string  `json:"textConnection"`
	LifeConnection string  `json:"lifeConnection"`
	ImageUrl       *string `json:"imageUrl"`
}

type QuestionRequest struct {
	StageId   string   `json:"stageId" validate:"required"`
	TaskId    string   `json:"taskId" validate:"required"`
	Content   string   `json:"content" validate:"required"`
	Keywords  []string `json:"keywords"`
}

type ValidateBlankRequest struct {
	TaskId   string `json:"taskId" validate:"required"`
	TextId   string `json:"textId" validate:"required"`
	BlankId  string `json:"blankId" validate:"required"`
	Input    string `json:"input" validate:"required"`
}

type PracticeRequest struct {
	StageId   string  `json:"stageId" validate:"required"`
	TaskId    string  `json:"taskId" validate:"required"`
	ItemId    string  `json:"itemId" validate:"required"`
	Content   string  `json:"content" validate:"required"`
	ImageUrl  *string `json:"imageUrl"`
}

type ReadAloudRequest struct {
	StageId       string `json:"stageId" validate:"required"`
	TaskId        string `json:"taskId" validate:"required"`
	ItemId        string `json:"itemId" validate:"required"`
	AudioUrl      string `json:"audioUrl" validate:"required"`
	ReferenceText string `json:"referenceText" validate:"required"`
}

type ChatRequest struct {
	StageId string `json:"stageId" validate:"required"`
	TaskId  string `json:"taskId" validate:"required"`
	Message string `json:"message" validate:"required"`
}

type ChatPolishRequest struct {
	StageId string `json:"stageId" validate:"required"`
	TaskId  string `json:"taskId" validate:"required"`
}

type ChatCreationRequest struct {
	StageId  string `json:"stageId" validate:"required"`
	TaskId   string `json:"taskId" validate:"required"`
	Action   string `json:"action" validate:"required,oneof=create skip"`
	OptionId string `json:"optionId"`
}

type FeedbackGenerateRequest struct {
	StageId string `json:"stageId" validate:"required"`
	TaskId  string `json:"taskId" validate:"required"`
}

type GroupCreateRequest struct {
	StageId       string   `json:"stageId" validate:"required"`
	TaskId        string   `json:"taskId" validate:"required"`
	CreationType  string   `json:"creationType" validate:"required"`
	MemberIds     []string `json:"memberIds" validate:"required,min=1"`
}

type MessageSendRequest struct {
	GroupId      string `json:"groupId" validate:"required"`
	Content      string `json:"content" validate:"required"`
	MessageType  string `json:"messageType"`
}

type MessageListRequest struct {
	GroupId  string `json:"groupId" validate:"required"`
	Page     int    `json:"page" validate:"min=1"`
	PageSize int    `json:"pageSize" validate:"min=1,max=100"`
}

type HomeworkRecommendRequest struct {
	StageId string `json:"stageId" validate:"required"`
	TaskId  string `json:"taskId" validate:"required"`
}

type HomeworkSubmitRequest struct {
	StageId      string  `json:"stageId" validate:"required"`
	TaskId       string  `json:"taskId" validate:"required"`
	Content      string  `json:"content" validate:"required"`
	CreationType string  `json:"creationType" validate:"required"`
	ImageUrl     *string `json:"imageUrl"`
}

type BadgeAwardRequest struct {
	StudentId  string `json:"studentId" validate:"required"`
	BadgeName  string `json:"badgeName" validate:"required"`
	Condition  string `json:"condition" validate:"required"`
	StageId    string `json:"stageId"`
}

type DashboardFilterRequest struct {
	ClassId   string `json:"classId"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	StageId   string `json:"stageId"`
}

type DashboardExportRequest struct {
	ClassId   string `json:"classId"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Format    string `json:"format" validate:"required,oneof=excel csv"`
}
