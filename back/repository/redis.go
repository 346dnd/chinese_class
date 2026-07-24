package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/edu-chinese-classroom/config"
	"github.com/edu-chinese-classroom/pkg/logger"
)

var rdb *redis.Client
var ctx = context.Background()

func InitRedis(cfg *config.RedisConfig) error {
	rdb = redis.NewClient(&redis.Options{
		Addr:         cfg.Addr,
		Password:     cfg.Password,
		DB:           cfg.DB,
		PoolSize:     cfg.PoolSize,
		MinIdleConns: cfg.MinIdleConns,
	})

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to ping redis: %w", err)
	}

	logger.Info("redis connection established")
	return nil
}

func GetRedis() *redis.Client {
	return rdb
}

func SetCache(key string, value interface{}, expiration time.Duration) error {
	return rdb.Set(ctx, key, value, expiration).Err()
}

func GetCache(key string) (string, error) {
	return rdb.Get(ctx, key).Result()
}

func DelCache(key string) error {
	return rdb.Del(ctx, key).Err()
}

func CacheExists(key string) (bool, error) {
	val, err := rdb.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return val == 1, nil
}

func SetNXCache(key string, value interface{}, expiration time.Duration) (bool, error) {
	return rdb.SetNX(ctx, key, value, expiration).Result()
}

func IncrCache(key string) (int64, error) {
	return rdb.Incr(ctx, key).Result()
}

func DecrCache(key string) (int64, error) {
	return rdb.Decr(ctx, key).Result()
}

func ZAddCache(key string, score float64, member string) error {
	return rdb.ZAdd(ctx, key, &redis.Z{Score: score, Member: member}).Err()
}

func ZRangeCache(key string, start, stop int64) ([]string, error) {
	return rdb.ZRange(ctx, key, start, stop).Result()
}

func SAddCache(key string, members ...string) error {
	return rdb.SAdd(ctx, key, members).Err()
}

func SIsMemberCache(key string, member string) (bool, error) {
	return rdb.SIsMember(ctx, key, member).Result()
}

func SRemCache(key string, members ...string) error {
	return rdb.SRem(ctx, key, members).Err()
}

func LPushCache(key string, values ...interface{}) error {
	return rdb.LPush(ctx, key, values).Err()
}

func RPopCache(key string) (string, error) {
	return rdb.RPop(ctx, key).Result()
}

func LRangeCache(key string, start, stop int64) ([]string, error) {
	return rdb.LRange(ctx, key, start, stop).Result()
}

func LLENCache(key string) (int64, error) {
	return rdb.LLen(ctx, key).Result()
}

func CloseRedis() {
	if rdb != nil {
		rdb.Close()
		logger.Info("redis connection closed")
	}
}
