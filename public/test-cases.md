# API TEST CASES - MyMoovie-APP(Node.js + MongoDB + JWT)

---

## AUTHENTICATION

### TC-01: Valid login
API: POST /login

Steps:
- Send valid username and password in Postman

Expected Result:
- 200 OK
- JWT token generated

Actual Result:
- 200 OK
- Token received successfully

Status: PASS

---

### TC-02: Invalid password login
API: POST /login

Steps:
- Send valid username with wrong password

Expected Result:
- 401 Unauthorized

Actual Result:
- 401 Unauthorized

Status: PASS

---

### TC-03: Empty login fields
API: POST /login

Steps:
- Send empty username and password

Expected Result:
- 400 Bad Request

Actual Result:
- 400 Bad Request

Status: PASS

---

## USERS

### TC-04: Get all users
API: GET /users

Steps:
- Send GET request in Postman

Expected Result:
- 200 OK with user list

Actual Result:
- 200 OK with user list returned

Status: PASS

---

### TC-05: Get user by username
API: GET /users/:username

Steps:
- Pass valid username in URL

Expected Result:
- 200 OK with user data

Actual Result:
- 200 OK with correct user data

Status: PASS

---

## MOVIES (PROTECTED)

### TC-06: Get movies without token
API: GET /movies

Steps:
- Send request without Authorization token

Expected Result:
- 401 Unauthorized

Actual Result:
- 401 Unauthorized

Status: PASS

---

### TC-07: Get movies with valid token
API: GET /movies

Steps:
- Add valid JWT token in Authorization header
- Send request

Expected Result:
- 200 OK with movie list

Actual Result:
- 200 OK with movie list returned

Status: PASS

---

### TC-08: Get movies with invalid token
API: GET /movies

Steps:
- Send request with fake token

Expected Result:
- 401 Unauthorized

Actual Result:
- 401 Unauthorized

Status: PASS

---

