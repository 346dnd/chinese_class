package response

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Response struct {
	Code    int         `json:"code"`
	Msg     string      `json:"msg"`
	Data    interface{} `json:"data"`
	TraceId string      `json:"traceId"`
}

const (
	CodeSuccess       = 0
	MsgSuccess        = "success"

	CodeInvalidParams       = 40001
	MsgInvalidParams        = "缺少必填字段"

	CodeInvalidFormat       = 40002
	MsgInvalidFormat        = "输入格式不正确"

	CodeUnauthorized        = 40101
	MsgUnauthorized         = "未授权"

	CodeTokenExpired        = 40102
	MsgTokenExpired         = "登录已过期"

	CodeNotFound            = 40401
	MsgNotFound             = "资源不存在"

	CodeEmptyInput          = 42201
	MsgEmptyInput           = "提交内容为空"

	CodeGarbledInput        = 42202
	MsgGarbledInput         = "无法识别"

	CodeSensitiveContent    = 42220
	MsgSensitiveContent     = "违规内容"

	CodeRateLimited         = 42901
	MsgRateLimited          = "请求过于频繁"

	CodeAIRateLimited       = 42902
	MsgAIRateLimited        = "AI正在忙碌中"

	CodeInternalError       = 50001
	MsgInternalError        = "服务器错误"

	CodeDatabaseError       = 50002
	MsgDatabaseError        = "数据库错误"

	CodeAIServiceError      = 50003
	MsgAIServiceError       = "AI服务错误"

	CodeStorageError        = 50004
	MsgStorageError         = "存储服务错误"
)

func Success(data interface{}, traceId ...string) *Response {
	tid := generateTraceId()
	if len(traceId) > 0 && traceId[0] != "" {
		tid = traceId[0]
	}
	return &Response{
		Code:    CodeSuccess,
		Msg:     MsgSuccess,
		Data:    data,
		TraceId: tid,
	}
}

func Error(code int, msg string, traceId ...string) *Response {
	tid := generateTraceId()
	if len(traceId) > 0 && traceId[0] != "" {
		tid = traceId[0]
	}
	return &Response{
		Code:    code,
		Msg:     msg,
		Data:    nil,
		TraceId: tid,
	}
}

func generateTraceId() string {
	return uuid.New().String()
}

func JSON(c *gin.Context, resp *Response) {
	c.JSON(200, resp)
}

func JSONSuccess(c *gin.Context, data interface{}) {
	traceId := c.GetString("traceId")
	c.JSON(200, Success(data, traceId))
}

func JSONError(c *gin.Context, code int, msg string) {
	traceId := c.GetString("traceId")
	c.JSON(200, Error(code, msg, traceId))
}

func JSONErrorWithStatus(c *gin.Context, status int, code int, msg string) {
	traceId := c.GetString("traceId")
	c.JSON(status, Error(code, msg, traceId))
}
