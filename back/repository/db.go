package repository

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/lib/pq"
	"github.com/edu-chinese-classroom/config"
	"github.com/edu-chinese-classroom/pkg/logger"
)

var db *sql.DB

func InitDB(cfg *config.DatabaseConfig) error {
	var err error
	db, err = sql.Open("postgres", cfg.DSN())
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(time.Duration(cfg.ConnMaxLifetime) * time.Second)

	err = db.Ping()
	if err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("database connection established")
	return nil
}

func GetDB() *sql.DB {
	return db
}

func BeginTx() (*sql.Tx, error) {
	return db.Begin()
}

func CloseDB() {
	if db != nil {
		db.Close()
		logger.Info("database connection closed")
	}
}
