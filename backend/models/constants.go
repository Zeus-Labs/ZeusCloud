package models

type Constants struct {
	Name  string `json:"name" gorm:"primaryKey"`
	Value int    `json:"value"`
}
