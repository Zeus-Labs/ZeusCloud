package models

type AccountDetails struct {
	AccountName        string       `json:"account_name" gorm:"primaryKey"`
	AwsAccessKeyId     SecretString `json:"aws_access_key_id"`
	AwsSecretAccessKey SecretString `json:"aws_secret_access_key"`
	DefaultRegion      string       `json:"default_region"`
}
