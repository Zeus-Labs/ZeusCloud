package models

type User struct {
	Email    string `json:"email" gorm:"primaryKey"`
	Password string `json:"password"`
}
