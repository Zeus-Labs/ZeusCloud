package models

import "time"

type AccountDetails struct {
	AccountName        string       `json:"account_name" gorm:"primaryKey"`
	ConnectionMethod   string       `json:"connection_method"`
	Profile            string       `json:"profile"`
	AwsAccessKeyId     SecretString `json:"aws_access_key_id"`
	AwsSecretAccessKey SecretString `json:"aws_secret_access_key"`
	DefaultRegion      string       `json:"default_region"`
	LastScanCompleted  *time.Time   `json:"last_scan_completed"`
}
