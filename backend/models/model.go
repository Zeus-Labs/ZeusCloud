package models

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql/driver"
	"fmt"
	"io"

	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

type SecretString string

var encryptionKey []byte

func SetEncryptionKey(key []byte) {
	encryptionKey = key
}

func gcmCipher() (cipher.AEAD, error) {
	c, err := aes.NewCipher(encryptionKey)

	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(c)

	if err != nil {
		return nil, err
	}

	return gcm, err
}

func (s *SecretString) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("could not scan value")
	}

	gcm, err := gcmCipher()

	if err != nil {
		return err
	}

	nonceSize := gcm.NonceSize()
	if len(bytes) < nonceSize {
		return fmt.Errorf("invalid secret")
	}

	nonce, ciphertext := bytes[:nonceSize], bytes[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return fmt.Errorf("error decoding token: %v", err)
	}

	*s = SecretString(plaintext)
	return nil
}

func (s SecretString) GormDBDataType(db *gorm.DB, field *schema.Field) string {
	return "bytea"
}

func (s SecretString) ValueBytes() ([]byte, error) {
	gcm, err := gcmCipher()

	if err != nil {
		return nil, err
	}

	// https://tutorialedge.net/golang/go-encrypt-decrypt-aes-tutorial/

	// creates a new byte array the size of the nonce
	// which must be passed to Seal
	nonce := make([]byte, gcm.NonceSize())
	// populates our nonce with a cryptographically secure
	// random sequence
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, fmt.Errorf("error decoding token %v", err)
	}

	res := gcm.Seal(nonce, nonce, []byte(s), nil)

	return res, nil
}

func (s SecretString) Value() (driver.Value, error) {
	v, err := s.ValueBytes()
	if err != nil {
		return nil, err
	}

	return driver.Value(v), nil
}
