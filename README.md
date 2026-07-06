# API Testing myMovie-app – Node.js + MongoDB + JWT Authentication

##  Project Overview
This project is a REST API built using Node.js and MongoDB. It provides user authentication and movie information services. The API is tested using Postman with focus on functional testing, authentication, authorization and negative testing scenarios.

---

##  Tech Stack
- Node.js
- JavaScript
- MongoDB
- JWT Authentication
- Postman
- GitHub

---

##  API Overview

### Authentication APIs
- POST /login

### User APIs
- GET /users
- GET /users/:username

### Movie APIs (Protected)
- GET /movies

---
##  Test Cases

All detailed test cases including steps, expected results, and execution status are documented in the `public/test-cases.md` file.


##  Testing Scope

The following testing types were performed:

- Functional Testing
- API Testing
- Authentication Testing (JWT Token)
- Authorization Testing (Protected Routes)
- Negative Testing
- Response Validation

---

##  Test Execution Summary

- Total Test Cases: 8
- Executed: 8
- Passed: 8
- Failed: 0
- Pending: 0

---

##  Test Evidence

Screenshots are available in the `/screenshots` folder:

- Login success response
- JWT token generation
- Movies API response
- Unauthorized access error

---




# myMovie-app

It is a server-side based web application.This application will provide users with access to information about different movies, directors. Users will be able to sign up, update their personal information,and create a list of their favorite movies.This app interacts with a database(MongoDB) that stores data about different movies. And stores users information.

# Project Dependencies

* Backend: Node.js, Express.
* Authentication: JWT (JSON Web Tokens).
* Database: MongoDB Atlas.


# Project Endpoints:

  Refer in documentation .html
