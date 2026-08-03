# EcoTrack — AI Powered Carbon Footprint & Sustainability Management Platform

## Project Overview

EcoTrack is a full-stack sustainability platform that helps users track their carbon footprint, set eco goals, get AI-powered recommendations, and monitor their environmental impact.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Security, JWT |
| Database | PostgreSQL 18 |
| ORM | Hibernate / JPA |
| Image Upload | Cloudinary |
| Frontend | Angular 18 |
| Build Tool | Maven (mvnw) |

---

## Backend Setup

### Prerequisites

Make sure you have the following installed before running the backend:

- **Java 17+** — https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- **Maven** — included via `mvnw` wrapper (no separate install needed)
- **PostgreSQL 18** — https://www.postgresql.org/download/
- **Git** — https://git-scm.com/

---

### 1. Clone the Repository

```bash
git clone https://github.com/springboardmentor84/Team2-Powered-Carbon-Footprint-Sustainability-Management-Platform-.git
cd Team2-Powered-Carbon-Footprint-Sustainability-Management-Platform-
```

---

### 2. Setup PostgreSQL Database

1. Open pgAdmin or any PostgreSQL client
2. Create a new database named `ecotrack`
3. Set your PostgreSQL credentials (username and password)

---

### 3. Configure application.properties

Navigate to `backend/src/main/resources/application.properties` and update with your local credentials:

```properties
spring.application.name=ecotrack-backend

spring.datasource.url=jdbc:postgresql://localhost:5432/ecotrack
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD

spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

server.port=8080

# JWT Configuration (86400000 = 24 hours in ms)
security.jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
security.jwt.expiration-time=86400000

# Cloudinary Configuration
cloudinary.cloud-name=ddszr1sdv
cloudinary.api-key=439172672988712
cloudinary.api-secret=ivDQR-Ao72Mc0TQV1ObcyktN4RA
```

---

### 4. Run the Backend

Navigate to the `backend` folder and run:

```cmd
.\mvnw.cmd spring-boot:run
```

The backend will start at: **http://localhost:8080**

You should see:
```
Started EcotrackBackendApplication in X seconds
```

---

## API Endpoints

### Auth (No token required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |

**Signup body:**
```json
{
  "fullName": "Your Name",
  "email": "you@example.com",
  "password": "Test@1234"
}
```

**Login body:**
```json
{
  "email": "you@example.com",
  "password": "Test@1234"
}
```

---

### User Profile (Bearer Token required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/user/profile` | Get user profile |
| PUT | `/api/v1/user/profile` | Update user profile |
| PUT | `/api/v1/user/preferences` | Update user preferences |
| POST | `/api/v1/user/profile/image` | Upload profile image (form-data, key: `image`) |

---

### Carbon Tracker (Bearer Token required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/carbon` | Create carbon entry |
| GET | `/api/v1/carbon` | Get all entries |
| GET | `/api/v1/carbon/{id}` | Get entry by ID |
| PUT | `/api/v1/carbon/{id}` | Update entry |
| DELETE | `/api/v1/carbon/{id}` | Delete entry |

**Carbon entry body:**
```json
{
  "category": "FOOD",
  "activity": "Cooking for kids",
  "quantity": 20,
  "unit": "minutes",
  "carbonEmission": 8.4
}
```

**Valid categories:** `FOOD`, `TRANSPORTATION`, `ELECTRICITY`, `WASTE`, `OTHER`

---

### Dashboard (Bearer Token required)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/dashboard/summary` | Get dashboard summary |

---

## Frontend Setup

Navigate to the frontend folder and run:

```cmd
cd frontend/ecotrack-frontend
npm install
npm start
```

Frontend runs at: **http://localhost:4200**

---

## Team

Team 2 — Springboard Mentorship Program

---

## Notes

- Each developer should configure their own `application.properties` with local DB credentials
- Never commit real credentials to GitHub
- JWT tokens expire after 24 hours — re-login to get a new token
