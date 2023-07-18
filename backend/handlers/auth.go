package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"time"

	"github.com/Zeus-Labs/ZeusCloud/models"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type customError struct {
	message    string
	statusCode int
}

const jwtExpiryInHours = 24
const jwtSecretKey = "ZeusCloudJWT"

func findUserByEmail(postgresDb *gorm.DB, email string) (models.User, customError) {
	var user models.User
	tx := postgresDb.Where("email=?", email).First(&user)
	if errors.Is(tx.Error, gorm.ErrRecordNotFound) {
		return user, customError{
			message:    "User not found",
			statusCode: http.StatusUnauthorized,
		}
	} else if tx.Error != nil {
		return user, customError{
			message:    tx.Error.Error(),
			statusCode: http.StatusInternalServerError,
		}
	}
	return user, customError{}
}

func validatePassword(password string) error {
	if len(password) < 8 {
		log.Printf("Password must be at least 8 characters.")
		return fmt.Errorf("Password must be at least 8 characters.")
	}
	return nil
}
func validateEmail(email string) error {
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	match, _ := regexp.MatchString(pattern, email)

	if !match {
		return fmt.Errorf("Invalid Email.")
	}
	return nil
}

func SignUp(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var user models.User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			log.Printf("failed to decode user, %v", err)
			http.Error(w, "Sign Up failed, Try again.", http.StatusInternalServerError)
			return
		}

		if err := validateEmail(user.Email); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := validatePassword(user.Password); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		_, err := findUserByEmail(postgresDb, user.Email)
		if err.message == "" {
			log.Printf("Sign Up failed, User already exists.")
			http.Error(w, "Sign Up failed, User already exists.", http.StatusBadRequest)
		} else if err.statusCode == http.StatusInternalServerError {
			log.Printf("Sign Up failed, %v", err.message)
			http.Error(w, "Sign Up failed, Try again.", http.StatusInternalServerError)
		} else {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
			if err != nil {
				log.Printf("Error in generating the encrypted password: %v", err)
				http.Error(w, "Sign Up failed, Try again.", http.StatusInternalServerError)
			}
			user.Password = string(hashedPassword)

			if tx := postgresDb.Clauses(clause.OnConflict{DoNothing: true}).Create(&user); tx.Error != nil {
				log.Printf("Error in inserting the user into the database: %v", tx.Error)
				http.Error(w, "Sign Up failed, Try again.", http.StatusInternalServerError)
			}
			w.WriteHeader(http.StatusOK)
		}
	}
}

func LogIn(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var user models.User
		if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
			log.Printf("failed to decode user, %v", err)
			http.Error(w, "Log In failed, Try again.", http.StatusInternalServerError)
			return
		}
		savedUser, err := findUserByEmail(postgresDb, user.Email)
		if err.statusCode == http.StatusUnauthorized {
			log.Printf("Log in failed, User does not exist.")
			http.Error(w, "Log in failed, User does not exist.", http.StatusBadRequest)
			return
		} else if err.statusCode == http.StatusInternalServerError {
			log.Printf("Log In failed, %v", err.message)
			http.Error(w, "Log In failed, Try again.", http.StatusInternalServerError)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(savedUser.Password), []byte(user.Password)); err != nil {
			log.Printf("Log In failed, incorrect password, error: %v", err)
			http.Error(w, "Log In failed, incorrect password.", http.StatusBadRequest)
			return
		}
		if token, err := generateJwtToken(user); err != nil {
			log.Printf("Log In failed, error in generating jwt token: %v", err)
			http.Error(w, "Log in Failed", http.StatusInternalServerError)
		} else {
			cookie := http.Cookie{
				Name:     "ZeusJwt",
				Value:    token,
				Expires:  time.Now().Add(time.Hour * jwtExpiryInHours),
				HttpOnly: true,
			}
			http.SetCookie(w, &cookie)
			w.WriteHeader(http.StatusOK)
		}
	}
}

func LogOut() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		cookie := http.Cookie{
			Name:     "ZeusJwt",
			Value:    "",
			Expires:  time.Now().Add(-time.Hour),
			HttpOnly: true,
		}
		http.SetCookie(w, &cookie)
		w.WriteHeader(http.StatusOK)
	}
}

func GetUser(postgresDb *gorm.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		jwtCookie, err := r.Cookie("ZeusJwt")
		if err != nil {
			log.Printf("Error in retrieving jwt cookie, error: %v", err)
			http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		}
		token, err := jwt.ParseWithClaims(jwtCookie.Value, &jwt.StandardClaims{}, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unauthorized.")
			}
			return []byte(jwtSecretKey), nil
		})
		if err != nil {
			log.Printf("Error in validating jwt token, error: %v", err)
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
		}
		if !token.Valid {
			log.Printf("JWT token is invalid: %v", err)
			http.Error(w, "Unauthorized.", http.StatusUnauthorized)
		}
		claims := token.Claims.(*jwt.StandardClaims)
		user, er := findUserByEmail(postgresDb, claims.Issuer)
		if er.message != "" {
			log.Printf("Error in retrieving user: %v", er.message)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
		retDataBytes, err := json.Marshal(user)
		if err != nil {
			log.Printf("Error marshalling user: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		}
		w.WriteHeader(http.StatusOK)
		w.Write(retDataBytes)
	}
}

func generateJwtToken(user models.User) (string, error) {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    user.Email,
		ExpiresAt: time.Now().Add(time.Hour * jwtExpiryInHours).Unix(),
	})
	token, err := t.SignedString([]byte(jwtSecretKey))
	return token, err
}
