package main

import (
	"database/sql"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

var (
	templates    = template.Must(template.ParseGlob("templates/*.html"))
	counterMutex sync.RWMutex
	sqliteDB     *sql.DB
)

func init() {

	var err error
	sqliteDB, err = sql.Open("sqlite", "visitors.db")
	if err != nil {
		log.Fatalf("Failed to open SQLite database: %v", err)
	}

	if err := initDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
}

func initDB() error {
	query := `
	CREATE TABLE IF NOT EXISTS visitor_stats (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		guest_count INTEGER NOT NULL DEFAULT 0
	);`

	if _, err := sqliteDB.Exec(query); err != nil {
		return err
	}

	var count int
	err := sqliteDB.QueryRow("SELECT COUNT(*) FROM visitor_stats").Scan(&count)
	if err != nil {
		return err
	}

	if count == 0 {
		_, err = sqliteDB.Exec("INSERT INTO visitor_stats (guest_count) VALUES (0)")
		return err
	}

	return nil
}

func main() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/time", timeHandler)
	http.HandleFunc("/stopwatch", stopwatchHandler)
	http.HandleFunc("/guestbook", guestbookHandler)
	http.HandleFunc("/api/counter", counterHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	addr := ":8000"
	log.Printf("🌈 90s Vaporwave Time Service starting at %s — open http://localhost%s 🌈\n", addr, addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatal(err)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	data := struct {
		GuestCount int64
	}{
		GuestCount: getGuestCounter(),
	}
	if err := templates.ExecuteTemplate(w, "index.html", data); err != nil {
		log.Printf("Template execute error: %v", err)
		http.Error(w, "Internal Server Error", 500)
	}
}

func stopwatchHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	data := struct {
		GuestCount int64
	}{
		GuestCount: getGuestCounter(),
	}
	if err := templates.ExecuteTemplate(w, "stopwatch.html", data); err != nil {
		log.Printf("Template execute error: %v", err)
		http.Error(w, "Internal Server Error", 500)
	}
}

func guestbookHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	data := struct {
		GuestCount       int64
		GiscusRepo       string
		GiscusRepoId     string
		GiscusCategory   string
		GiscusCategoryId string
	}{
		GuestCount:       getGuestCounter(),
		GiscusRepo:       os.Getenv("GISCUS_REPO"),
		GiscusRepoId:     os.Getenv("GISCUS_REPO_ID"),
		GiscusCategory:   os.Getenv("GISCUS_CATEGORY"),
		GiscusCategoryId: os.Getenv("GISCUS_CATEGORY_ID"),
	}
	if err := templates.ExecuteTemplate(w, "guestbook.html", data); err != nil {
		log.Printf("Template execute error: %v", err)
		http.Error(w, "Internal Server Error", 500)
	}
}

func timeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	type resp struct {
		ServerUnixMs int64  `json:"server_unix_ms"`
		ISO          string `json:"iso"`
		UTCOffset    int    `json:"utc_offset_seconds"`
	}
	now := time.Now().UTC()
	js := resp{
		ServerUnixMs: now.UnixNano() / int64(time.Millisecond),
		ISO:          now.Format(time.RFC3339Nano),
		UTCOffset:    0,
	}
	json.NewEncoder(w).Encode(js)
}

func counterHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "POST" {
		incrementGuestCounter()
	}

	count := getGuestCounter()
	response := struct {
		Count int64 `json:"count"`
	}{
		Count: count,
	}
	json.NewEncoder(w).Encode(response)
}

func incrementGuestCounter() {
	counterMutex.Lock()
	defer counterMutex.Unlock()

	_, err := sqliteDB.Exec("UPDATE visitor_stats SET guest_count = guest_count + 1 WHERE id = 1")
	if err != nil {
		log.Printf("Error incrementing guest counter: %v", err)
	}
}

func getGuestCounter() int64 {
	counterMutex.RLock()
	defer counterMutex.RUnlock()

	var count int64
	err := sqliteDB.QueryRow("SELECT guest_count FROM visitor_stats WHERE id = 1").Scan(&count)
	if err != nil {
		log.Printf("Error getting guest counter: %v", err)
		return 0
	}
	return count
}
