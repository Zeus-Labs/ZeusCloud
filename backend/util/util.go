package util

import (
	"fmt"
	"time"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j/db"
)

func ParseAsStringList(record *db.Record, key string) ([]string, error) {
	value, _ := record.Get(key)
	valueAsLst, ok := value.([]interface{})
	if !ok {
		return nil, fmt.Errorf("%v %v should be of type []interface{}", key, valueAsLst)
	}
	var valueAsStrLst []string
	for _, v := range valueAsLst {
		vStr, ok := v.(string)
		if !ok {
			return nil, fmt.Errorf("%v should be of type string", vStr)
		}
		valueAsStrLst = append(valueAsStrLst, vStr)
	}
	return valueAsStrLst, nil
}

func ParseAsTime(record *db.Record, key string) (time.Time, error) {
	value, _ := record.Get(key)
	valueAsString, ok := value.(string)
	if !ok {
		return time.Time{}, fmt.Errorf("%v %v should be of type string", key, valueAsString)
	}
	return time.Parse("2006-01-02 15:04:05+00:00", valueAsString)
}

func ParseAsOptionalTime(record *db.Record, key string) *time.Time {
	t, err := ParseAsTime(record, key)
	if err != nil {
		return nil
	}
	return &t
}
