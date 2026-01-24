package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
)

type User string
type AuthHandlerFunc func(http.ResponseWriter, *http.Request, User)

func checkCookie(db Repo, r *http.Request) (User, *httpError) {
	session, err := r.Cookie("session")
	if err != nil && err != http.ErrNoCookie {
		return "", &httpError{fmt.Sprintf("Unexpected error reading session cookie: %v", err), http.StatusInternalServerError}
	}

	if session == nil {
		return "", &httpError{"No session cookie", http.StatusUnauthorized}
	}

	fields := strings.Fields(session.Value)
	if len(fields) != 2 {
		return "", &httpError{"Malformed session cookie", http.StatusUnauthorized}
	}

	email := fields[0]
	cookieNonce := fields[1]
	userNonce := db.GetSession(r.Context(), email)
	if userNonce != cookieNonce {
		return "", &httpError{fmt.Sprintf("Invalid session cookie for email %s", email), http.StatusUnauthorized}
	}
	return User(email), nil
}

func checkHeader(db Repo, r *http.Request) (User, *httpError) {
	// OAuth2-Proxy sets this header with the authenticated user's email
	// (--pass-user-headers sends X-Forwarded-Email)
	email := r.Header.Get("X-Forwarded-Email")
	if email == "" {
		return "", &httpError{"No X-Forwarded-Email header", http.StatusUnauthorized}
	}

	// Ensure user exists in our database
	nonce := db.GetSession(r.Context(), email)
	if nonce == "" {
		return "", &httpError{fmt.Sprintf("No registered user %s", email), http.StatusUnauthorized}
	}

	return User(email), nil
}

func requireAuth(db Repo) func(AuthHandlerFunc) http.HandlerFunc {
	return func(next AuthHandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			var err *httpError
			var user User

			// Primary authentication: check OAuth2-Proxy header
			if user, err = checkHeader(db, r); err == nil {
				log.Printf("OAuth2-Proxy auth for %s succeeded", user)
				next(w, r, user)
				return
			}

			// Fallback: check session cookie (for backwards compatibility)
			log.Printf("No OAuth2-Proxy header, checking cookie: %v", err)
			if user, err = checkCookie(db, r); err == nil {
				log.Printf("Cookie auth for %s succeeded", user)
				next(w, r, user)
				return
			}

			logError(w, err.Message, err.Code)
		}
	}
}
