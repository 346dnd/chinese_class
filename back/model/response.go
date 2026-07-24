package model

type Response struct {
	Code    int         `json:"code"`
	Msg     string      `json:"msg"`
	Data    interface{} `json:"data"`
	TraceId string      `json:"traceId"`
}

type CourseResponse struct {
	ID     string       `json:"id"`
	Title  string       `json:"title"`
	Stages []StageBrief `json:"stages"`
}

type StageBrief struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Order     int    `json:"order"`
	TaskCount int    `json:"taskCount"`
}

type StageResponse struct {
	ID       string       `json:"id"`
	Name     string       `json:"name"`
	Order    int          `json:"order"`
	Progress ProgressInfo `json:"progress"`
	Tasks    []TaskConfig `json:"tasks"`
}

type ProgressInfo struct {
	CurrentTaskIndex   int      `json:"currentTaskIndex"`
	CompletedTaskIds   []string `json:"completedTaskIds"`
}

type TaskConfig struct {
	ID                 string              `json:"id"`
	Type               string              `json:"type"`
	Title              string              `json:"title"`
	DigitalHumanPrompt string              `json:"digitalHumanPrompt"`
	Texts              []TextConfig        `json:"texts,omitempty"`
	MinQuestions       int                 `json:"minQuestions,omitempty"`
	Retry              RetryConfig         `json:"retry"`
	FeedbackOverlay    FeedbackOverlayConfig `json:"feedbackOverlay"`
}

type TextConfig struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Prompt      string   `json:"prompt,omitempty"`
	MinLength   int      `json:"minLength,omitempty"`
	MaxLength   int      `json:"maxLength,omitempty"`
	AllowPhoto  bool     `json:"allowPhoto,omitempty"`
	Blanks      []BlankConfig `json:"blanks,omitempty"`
}

type BlankConfig struct {
	ID            string `json:"id"`
	CorrectAnswer string `json:"correctAnswer"`
	Context       string `json:"context"`
}

type RetryConfig struct {
	MaxRetries   int    `json:"maxRetries"`
	OnExhausted  string `json:"onExhausted"`
}

type FeedbackOverlayConfig struct {
	Forced bool `json:"forced"`
}

type WriteResponse struct {
	Passed        bool    `json:"passed"`
	Feedback      string  `json:"feedback"`
	RetryCount    int     `json:"retryCount"`
	RetryExhausted bool   `json:"retryExhausted"`
	CorrectAnswer string  `json:"correctAnswer,omitempty"`
	NextAction    string  `json:"nextAction"`
}

type QuestionResponse struct {
	Passed          bool     `json:"passed"`
	Feedback        string   `json:"feedback"`
	RetryCount      int      `json:"retryCount"`
	RetryExhausted  bool     `json:"retryExhausted"`
	RelatedKeywords []string `json:"relatedKeywords,omitempty"`
}

type ValidateBlankResponse struct {
	Correct         bool    `json:"correct"`
	Feedback        string  `json:"feedback,omitempty"`
	RetryCount      int     `json:"retryCount"`
	Exhausted       bool    `json:"exhausted"`
	RevealedAnswer  string  `json:"revealedAnswer,omitempty"`
}

type PracticeResponse struct {
	Passed          bool    `json:"passed"`
	Feedback        string  `json:"feedback"`
	RetryCount      int     `json:"retryCount"`
	RetryExhausted  bool    `json:"retryExhausted"`
	CorrectAnswer   string  `json:"correctAnswer,omitempty"`
}

type ChatResponse struct {
	Reply           string  `json:"reply"`
	RetryCount      int     `json:"retryCount"`
	RetryExhausted  bool    `json:"retryExhausted"`
	CorrectAnswer   string  `json:"correctAnswer,omitempty"`
}

type ChatPolishResponse struct {
	Original string `json:"original"`
	Polished string `json:"polished"`
}

type ChatCreationResponse struct {
	NextAction   string `json:"nextAction"`
	CreationUrl  string `json:"creationUrl,omitempty"`
}

type FeedbackResponse struct {
	Type       string `json:"type"`
	Script     string `json:"script"`
	DurationMs int    `json:"durationMs"`
}

type MediaUploadResponse struct {
	URL string `json:"url"`
}

type GroupCreateResponse struct {
	GroupId       string   `json:"groupId"`
	Members       []string `json:"members"`
	CreationType  string   `json:"creationType"`
}

type MessageSendResponse struct {
	MessageId  string `json:"messageId"`
	Content    string `json:"content"`
	Timestamp  string `json:"timestamp"`
}

type MessageListResponse struct {
	Messages  []MessageItem `json:"messages"`
	Total     int           `json:"total"`
	Page      int           `json:"page"`
	PageSize  int           `json:"pageSize"`
}

type MessageItem struct {
	MessageId   string `json:"messageId"`
	SenderId    string `json:"senderId"`
	SenderName  string `json:"senderName"`
	Content     string `json:"content"`
	MessageType string `json:"messageType"`
	Timestamp   string `json:"timestamp"`
}

type HomeworkRecommendResponse struct {
	Level           string   `json:"level"`
	Title           string   `json:"title"`
	RequiredTask    string   `json:"requiredTask"`
	OptionalTasks   []string `json:"optionalTasks"`
	ScoreThreshold  int      `json:"scoreThreshold"`
}

type BadgeAwardResponse struct {
	Success     bool   `json:"success"`
	BadgeName   string `json:"badgeName"`
	AwardTime   string `json:"awardTime"`
	Condition   string `json:"condition"`
}

type DashboardDataResponse struct {
	Participation  ParticipationData `json:"participation"`
	Correctness    CorrectnessData   `json:"correctness"`
	WordCloud      []WordCloudItem   `json:"wordCloud"`
	CreationTypes  []CreationTypeItem `json:"creationTypes"`
	PreviewData    PreviewData       `json:"previewData"`
}

type ParticipationData struct {
	Total     int     `json:"total"`
	Completed int     `json:"completed"`
	Rate      float64 `json:"rate"`
}

type CorrectnessData struct {
	Total   int     `json:"total"`
	Correct int     `json:"correct"`
	Rate    float64 `json:"rate"`
}

type WordCloudItem struct {
	Word  string `json:"word"`
	Count int    `json:"count"`
}

type CreationTypeItem struct {
	Type  string  `json:"type"`
	Count int     `json:"count"`
	Rate  float64 `json:"rate"`
}

type PreviewData struct {
	TextConnection float64 `json:"textConnection"`
	LifeConnection float64 `json:"lifeConnection"`
}
