# EVENTRIX - Member 3

Public-facing event discovery and event details module for the EVENTRIX platform.

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Java 21
- Spring Boot
- Spring Data JPA
- Maven

### Database and Infrastructure
- PostgreSQL 16
- Flyway
- Docker Compose

## Prerequisites

- Git
- Docker Desktop
- Docker Compose

## Getting Started

1. Clone this repository.
2. Copy `.env.example` to `.env`.
3. Set your local PostgreSQL password in `.env`.
4. Start the application:

```bash
docker compose up -d --build

Application URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Published Events API: http://localhost:8080/api/events/published
Database
Flyway manages database migrations automatically when the backend starts.

PostgreSQL data is persisted in the Docker volume eventrix_member3_data.

Do not use docker compose down -v unless you intentionally want to delete the database volume.
Current Implementation
- Public homepage connected to published backend events.
- Event discovery and filtering page connected to the backend.
- UUID-based event details page.
- Expanded event schema and entity mappings for organizers, media, speakers, sessions, facilities, and audiences.
Team Integration
This repository contains Member 3's public frontend and related backend integration work.

Coordinate shared API and database changes with the team before modifying shared contracts.