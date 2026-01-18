package main

import (
	"context"
	"log"

	"github.com/kelseyhightower/envconfig"
	"github.com/rcbilson/recipe/llm"
	"github.com/rcbilson/recipe/www"
)

type specification struct {
	Port         int    `default:"9000"`
	FrontendPath string `default:"/home/richard/src/recipe/frontend/dist"`
	DbFile       string `default:"/home/richard/src/recipe/data/recipe.db"`
}

var spec specification

func main() {
	err := envconfig.Process("recipeserver", &spec)
	if err != nil {
		log.Fatal("error reading environment variables:", err)
	}

	llm, err := llm.New(context.Background(), theModel.Params)
	if err != nil {
		log.Fatal("error initializing llm interface:", err)
	}

	summarizer := newSummarizer(llm, *theModel)

	db, err := NewRepo(spec.DbFile)
	if err != nil {
		log.Fatal("error initializing database interface:", err)
	}
	defer db.Close()

	handler(summarizer, db, www.FetcherCombined, spec.Port, spec.FrontendPath)
}
