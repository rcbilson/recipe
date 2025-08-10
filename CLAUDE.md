## Go Development
- When using `go run`, `go test`, or `go build`, pass the `-tags fts5` argument to build the SQLite FTS5 module.

## Project Structure
- The frontend code is in the subdirectory `frontend`
- The backend code is in the subdirectory `backend`

## Frontend Development
- When working with the frontend code, use `yarn` instead of `npm`
- To verify that the frontend code builds correctly, use `yarn run check`

## Backend Development
- When implementing a change to the schema, do this by adding a new set of SQL statements to the list in backend/cmd/server/schema.go that implements the required set of changes and migrations.
