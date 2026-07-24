package config

import (
	"fmt"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type Config struct {
	Server     ServerConfig     `mapstructure:"server"`
	Database   DatabaseConfig   `mapstructure:"database"`
	Redis      RedisConfig      `mapstructure:"redis"`
	Coze       CozeConfig       `mapstructure:"coze"`
	TTS        TTSConfig        `mapstructure:"tts"`
	Storage    StorageConfig    `mapstructure:"storage"`
	CORS       CORSConfig       `mapstructure:"cors"`
	RateLimit  RateLimitConfig  `mapstructure:"rate_limit"`
	Logging    LoggingConfig    `mapstructure:"logging"`
}

type ServerConfig struct {
	Port string `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Host            string `mapstructure:"host"`
	Port            int    `mapstructure:"port"`
	User            string `mapstructure:"user"`
	Password        string `mapstructure:"password"`
	DBName          string `mapstructure:"dbname"`
	SSLMode         string `mapstructure:"sslmode"`
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	ConnMaxLifetime int    `mapstructure:"conn_max_lifetime"`
}

func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.DBName, d.SSLMode)
}

type RedisConfig struct {
	Addr         string `mapstructure:"addr"`
	Password     string `mapstructure:"password"`
	DB           int    `mapstructure:"db"`
	PoolSize     int    `mapstructure:"pool_size"`
	MinIdleConns int    `mapstructure:"min_idle_conns"`
}

type CozeConfig struct {
	APIKey     string `mapstructure:"api_key"`
	APIBaseURL string `mapstructure:"api_base_url"`
	Timeout    int    `mapstructure:"timeout"`
	RetryCount int    `mapstructure:"retry_count"`
}

type TTSConfig struct {
	APIKey     string `mapstructure:"api_key"`
	APIBaseURL string `mapstructure:"api_base_url"`
	Timeout    int    `mapstructure:"timeout"`
	RetryCount int    `mapstructure:"retry_count"`
}

type StorageConfig struct {
	Provider          string `mapstructure:"provider"`
	LocalPath         string `mapstructure:"local_path"`
	OSSEndpoint       string `mapstructure:"oss_endpoint"`
	OSSAccessKeyID    string `mapstructure:"oss_access_key_id"`
	OSSAccessKeySecret string `mapstructure:"oss_access_key_secret"`
	OSSBucket         string `mapstructure:"oss_bucket"`
	COSSecretID       string `mapstructure:"cos_secret_id"`
	COSSecretKey      string `mapstructure:"cos_secret_key"`
	COSRegion         string `mapstructure:"cos_region"`
	COSBucket         string `mapstructure:"cos_bucket"`
}

type CORSConfig struct {
	AllowOrigins []string `mapstructure:"allow_origins"`
}

type RateLimitConfig struct {
	RequestsPerSecond int `mapstructure:"requests_per_second"`
	Burst             int `mapstructure:"burst"`
}

type LoggingConfig struct {
	Level      string `mapstructure:"level"`
	OutputPath string `mapstructure:"output_path"`
	MaxSize    int    `mapstructure:"max_size"`
	MaxBackups int    `mapstructure:"max_backups"`
	MaxAge     int    `mapstructure:"max_age"`
}

var cfg *Config

func LoadConfig() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("../config")
	viper.AddConfigPath("../../config")

	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	cfg = &Config{}
	if err := viper.Unmarshal(cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	zap.L().Info("config loaded successfully")
	return cfg, nil
}

func GetConfig() *Config {
	return cfg
}
