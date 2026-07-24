package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/edu-chinese-classroom/repository"
)

const (
	heartbeatInterval = 15 * time.Second
	heartbeatTimeout  = 45 * time.Second
)

type Message struct {
	Type      string          `json:"type"`
	MessageId string          `json:"messageId"`
	Payload   json.RawMessage `json:"payload"`
	Seq       int64           `json:"seq"`
}

type HeartbeatPayload struct {
	Timestamp string `json:"timestamp"`
}

type ReconnectPayload struct {
	StudentId string `json:"studentId"`
	LastSeq   int64  `json:"lastSeq"`
	GroupId   string `json:"groupId"`
}

type SyncPayload struct {
	Messages []Message `json:"messages"`
	LastSeq  int64     `json:"lastSeq"`
}

type connection struct {
	conn     *websocket.Conn
	studentId string
	groupId   string
	lastSeq   int64
	mu        sync.Mutex
	lastPing  time.Time
}

var (
	connections   = make(map[string]*connection)
	connectionsMu sync.Mutex
	upgrader      = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	messageSeq = make(map[string]int64)
	seqMu      sync.Mutex
)

func GetConn(studentId string) *connection {
	connectionsMu.Lock()
	defer connectionsMu.Unlock()
	return connections[studentId]
}

func WSHandler(w http.ResponseWriter, r *http.Request) {
	studentId := r.URL.Query().Get("studentId")
	if studentId == "" {
		http.Error(w, "缺少studentId参数", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrade error: %v", err)
		return
	}

	c := &connection{
		conn:     conn,
		studentId: studentId,
		lastPing: time.Now(),
	}

	connectionsMu.Lock()
	connections[studentId] = c
	connectionsMu.Unlock()

	go c.readLoop()
	go c.heartbeatLoop()
}

func (c *connection) readLoop() {
	defer func() {
		c.conn.Close()
		connectionsMu.Lock()
		delete(connections, c.studentId)
		connectionsMu.Unlock()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case "heartbeat":
			c.lastPing = time.Now()
		case "reconnect":
			c.handleReconnect(msg)
		case "message":
			c.handleMessage(msg)
		}
	}
}

func (c *connection) heartbeatLoop() {
	ticker := time.NewTicker(heartbeatInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.mu.Lock()
			if time.Since(c.lastPing) > heartbeatTimeout {
				c.conn.Close()
				c.mu.Unlock()
				return
			}

			heartbeatMsg := Message{
				Type:      "heartbeat",
				MessageId: generateMessageId(),
				Payload:   json.RawMessage(`{"timestamp":"` + time.Now().Format(time.RFC3339) + `"}`),
				Seq:       c.getNextSeq(),
			}

			if err := c.conn.WriteJSON(heartbeatMsg); err != nil {
				c.mu.Unlock()
				return
			}
			c.mu.Unlock()
		}
	}
}

func (c *connection) handleReconnect(msg Message) {
	var payload ReconnectPayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		return
	}

	c.studentId = payload.StudentId
	c.groupId = payload.GroupId
	c.lastSeq = payload.LastSeq

	offlineMessages := c.getOfflineMessages(payload.LastSeq)

	syncMsg := Message{
		Type:      "sync",
		MessageId: generateMessageId(),
		Payload:   json.RawMessage(`{"messages":[],"lastSeq":` + string(rune(c.lastSeq+'0')) + `}`),
		Seq:       c.getNextSeq(),
	}

	if len(offlineMessages) > 0 {
		data, _ := json.Marshal(SyncPayload{
			Messages: offlineMessages,
			LastSeq:  c.lastSeq,
		})
		syncMsg.Payload = data
	}

	c.conn.WriteJSON(syncMsg)
}

func (c *connection) handleMessage(msg Message) {
	seq := c.getNextSeq()
	msg.Seq = seq

	c.broadcastMessage(msg)
}

func (c *connection) broadcastMessage(msg Message) {
	connectionsMu.Lock()
	defer connectionsMu.Unlock()

	for _, conn := range connections {
		if conn.groupId == c.groupId && conn.studentId != c.studentId {
			go func(c *connection) {
				c.mu.Lock()
				defer c.mu.Unlock()
				c.conn.WriteJSON(msg)
			}(conn)
		}
	}
}

func (c *connection) getOfflineMessages(lastSeq int64) []Message {
	return []Message{}
}

func (c *connection) getNextSeq() int64 {
	seqMu.Lock()
	defer seqMu.Unlock()
	if _, ok := messageSeq[c.studentId]; !ok {
		messageSeq[c.studentId] = 0
	}
	messageSeq[c.studentId]++
	return messageSeq[c.studentId]
}

func generateMessageId() string {
	return "msg-" + time.Now().Format("20060102150405")
}

func SendMessageToStudent(studentId string, msg Message) error {
	connectionsMu.Lock()
	conn, ok := connections[studentId]
	connectionsMu.Unlock()

	if !ok {
		saveOfflineMessage(studentId, msg)
		return nil
	}

	conn.mu.Lock()
	defer conn.mu.Unlock()
	return conn.conn.WriteJSON(msg)
}

func saveOfflineMessage(studentId string, msg Message) {
	key := "offline_messages:" + studentId
	data, _ := json.Marshal(msg)
	repository.LPushCache(key, string(data))
	repository.LLENCache(key)
}
