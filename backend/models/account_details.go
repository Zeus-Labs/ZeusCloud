package models

import (
	"time"

	"github.com/lib/pq"
)

type AccountDetails struct {
	AccountName        string         `json:"account_name" gorm:"primaryKey"`
	ConnectionMethod   string         `json:"connection_method"`
	Profile            string         `json:"profile"`
	AwsAccessKeyId     string         `json:"aws_access_key_id"`
	AwsSecretAccessKey string         `json:"aws_secret_access_key"`
	LastScanCompleted  *time.Time     `json:"last_scan_completed"`
	ScanStatus         string         `json:"scan_status"`
	RunningTime        float64        `json:"running_time,omitempty"`
	RegionNames        pq.StringArray `json:"region_names" gorm:"type:text[]"`
}
