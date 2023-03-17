package util

import (
	"fmt"
	"time"

	"github.com/neo4j/neo4j-go-driver/v4/neo4j/db"
)

func ParseAsOptionalStringList(record *db.Record, key string) ([]string, error) {
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

func ParseAsOptionalTime(record *db.Record, key string) (*time.Time, error) {
	value, _ := record.Get(key)
	valueAsString, ok := value.(string)
	if !ok {
		return nil, fmt.Errorf("%v %v should be of type string", key, valueAsString)
	}
	valueTime, err := time.Parse("2006-01-02 15:04:05+00:00", valueAsString)
	if err != nil {
		return nil, err
	}
	return &valueTime, nil
}

func ParseAsOptionalTimeISO8601(record *db.Record, key string) (*time.Time, error) {
	value, _ := record.Get(key)
	valueAsString, ok := value.(string)
	if !ok {
		return nil, fmt.Errorf("%v %v should be of type string", key, valueAsString)
	}
	valueTime, err := time.Parse("2006-01-02T15:04:05.000-07:00", valueAsString)
	if err != nil {
		return nil, err
	}
	return &valueTime, nil
}

func ParseAsOptionalString(record *db.Record, key string) (*string, error) {
	value, _ := record.Get("key")
	valueStr, ok := value.(string)
	if !ok {
		return nil, fmt.Errorf("value %v should be of type string", valueStr)
	}
	return &valueStr, nil
}

func ParseAsOptionalBool(record *db.Record, key string) (*bool, error) {
	value, _ := record.Get("key")
	valueBool, ok := value.(bool)
	if !ok {
		return nil, fmt.Errorf("value %v should be of type bool", valueBool)
	}
	return &valueBool, nil
}

func ParseAsOptionalInt(record *db.Record, key string) (*int, error) {
	value, _ := record.Get("key")
	valueInt, ok := value.(int)
	if !ok {
		return nil, fmt.Errorf("value %v should be of type int", valueInt)
	}
	return &valueInt, nil
}
