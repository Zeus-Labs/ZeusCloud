package models

import "time"

type RuleResult struct {
	RuleData     RuleData  `json:"rule_data"`
	RuleDataUID  string    `json:"rule_data_uid" gorm:"primaryKey"`
	ResourceID   string    `json:"resource_id" gorm:"primaryKey"`
	ResourceType string    `json:"resource_type"`
	AccountID    string    `json:"account_id"`
	Status       string    `json:"status"`
	Context      string    `json:"context"`
	FirstSeen    time.Time `json:"first_seen"`
	LastSeen     time.Time `json:"last_seen"`
	Muted        bool      `json:"muted"`
}
