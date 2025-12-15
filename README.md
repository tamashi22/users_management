# User Management System

A web-based user administration system with authentication, authorization, and full CRUD operations for managing users. Built with Node.js, Express.js, PostgreSQL, and EJS templating engine.

## Table of Contents

- [About the Project](#about-the-project)
- [Libraries and Technologies](#libraries-and-technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Database Management](#database-management)
- [Features](#features)

## About the Project

This is a secure user management web application that allows administrators to:

- **View** a paginated and sortable list of all users
- **Create** new user accounts with validation
- **View** detailed user profile information
- **Edit** existing user information
- **Delete** user accounts
- **Authenticate** using JWT-based authentication with access and refresh tokens
- **Authorize** access control (admin-only routes)

The application follows RESTful principles, implements security best practices and uses a modular, maintainable code structure.

## Libraries and Technologies

### Backend Framework

- **Express.js** - Web application framework for Node.js
- **Node.js** - JavaScript runtime environment

### Database

- **PostgreSQL** - Relational database (running in Docker)
- **Sequelize** - Promise-based ORM for Node.js

### Authentication & Security

- **jsonwebtoken** - JWT implementation for authentication
- **bcryptjs** - Password hashing library
- **csrf** - CSRF protection middleware
- **cookie-parser** - Cookie parsing middleware

### Validation & Forms

- **express-validator** - Server-side input validation
- **method-override** - HTTP method override support

### Templating & Frontend

- **EJS** - Embedded JavaScript templating engine

### Development Tools

- **nodemon** - Development server with auto-reload
- **sequelize-cli** - Sequelize command-line interface
- **dotenv** - Environment variables management

## Project Structure

```
testAuthApp/
├── backups/                    # SQL database dumps
│   └── backup_*.sql           # Database backup files
├── public/                     # Static assets
│   ├── icons/                 # SVG icon files
│   └── styles/                # CSS stylesheets
├── scripts/                    # Utility scripts
├── src/                        # Application source code
│   ├── config/                # Configuration files
│   │   └── db.js             # Database connection configuration
│   ├── constants/             # Application constants
│   ├── controllers/           # Request handlers
│   ├── middlewares/           # Express middlewares
│   ├── models/                # Sequelize models
│   ├── routes/                # Route definitions
│   │   ├── api/              # API routes (JSON responses)
│   │   └── web/              # Web routes (HTML responses)
│   ├── seeders/               # Database seeders
│   ├── services/              # Business logic layer
│   ├── utils/                 # Utility functions
│   ├── validators/            # Input validators
│   ├── views/                 # EJS templates
│   │   ├── layouts/          # Layout templates
│   │   ├── pages/            # Page templates
│   │   └── partials/         # Reusable template components
│   ├── app.js                 # Express application setup
│   └── server.js              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── .sequelizerc               # Sequelize CLI configuration
├── docker-compose.yml         # Docker Compose configuration
├── package.json               # Node.js dependencies and scripts
└── README.md                  # This file
```

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16.x or higher) - [Download](https://nodejs.org/)
- **Docker** - [Download](https://www.docker.com/get-started)

Verify installations:

```bash
node --version    # Should be v16.x or higher
docker --version  # Should show Docker version
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/tamashi22/users_management.git
cd users_management
```

### 2. Install Dependencies

Install all required Node.js packages:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:

- Express.js and related middleware
- Sequelize ORM and PostgreSQL driver
- Authentication libraries (JWT, bcrypt)
- Validation libraries
- Development tools (nodemon, sequelize-cli)

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Edit the `.env` file and set the following variables:

```env
# PostgreSQL Database Configuration
POSTGRES_USER='root'
POSTGRES_PASSWORD='your_secure_password'
POSTGRES_HOST='localhost'
POSTGRES_PORT='5433'
POSTGRES_DB='user_management_db'

# JWT Secrets
JWT_SECRET='your_jwt_secret_key_here'
REFRESH_SECRET='your_refresh_secret_key_here'

# Server Configuration
PORT=3000
NODE_ENV='development'
```

### 4. Start PostgreSQL Database with Docker

Start the PostgreSQL database container using Docker Compose:

```bash
docker-compose up -d
```

Verify the container is running:

```bash
docker ps | grep user_management_db
```

You should see the container running and listening on port 5433.

## Running the Application

### Development Mode (with auto-reload)

Start the application in development mode using nodemon:

```bash
npm run dev
```

This will:

- Start the Express server
- Automatically restart the server when you make code changes
- Connect to the PostgreSQL database
- Automatically sync database models
- Seed demo users if the database is empty
- Listen on port 3000 (or the port specified in `.env`)

### Production Mode

Start the application in production mode:

```bash
npm start
```

The server will start and you'll see:

```
Initializing database...
Database initialized successfully
✓ Database synchronized successfully.
Server is running on port 3000
```

### Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

You will be redirected to the login page at `/login`.

## Database Management

### Automatic Database Initialization

On first startup, the application will:

1. Connect to the PostgreSQL database
2. Create database tables if they don't exist (using Sequelize sync)
3. Automatically seed demo users if the database is empty

### Manual Database Seeding

To manually seed the database with demo users:

```bash
npm run db:seed
```

### Database Backup

Create a backup of the database:

```bash
npm run db:backup
```

This will create a SQL dump file in the `backups/` directory with a timestamp.

### Restore Database from Backup

To restore the database from a backup file:

```bash
# Option 1: Restore from local file
docker exec -i user_management_db psql -U root -d user_management_db < backups/backup_2025-12-14_19-46-34.sql

# Option 2: If dump is in container volume
docker exec -i user_management_db psql -U root -d user_management_db < /backups/backup_2025-12-14_19-46-34.sql
```

**Note:** Replace `backup_2025-12-14_19-46-34.sql` with your actual backup filename.

## Features

### Authentication

- JWT-based authentication with access and refresh tokens
- Tokens stored in httpOnly cookies for security
- Automatic token refresh on expiration
- Secure password hashing using bcrypt

### Authorization

- Role-based access control (Admin/User)
- Admin-only routes for user management

### User Management (Admin Only)

- **List Users**: Paginated table with sorting by username, first name, last name, birth date, or creation date
- **View User**: Detailed user profile page
- **Create User**: Form with validation for creating new users
- **Edit User**: Edit user information
- **Delete User**: Delete user accounts

### Data Validation

- Server-side validation using express-validator
- Form field validation (username, password, names, dates, etc.)
- User-friendly error messages

### Security Features

- **SQL Injection Protection**: Parameterized queries via Sequelize ORM
- **XSS Prevention**: EJS template auto-escaping for user input
- **CSRF Protection**: CSRF tokens for state-changing requests
- **Secure Cookies**: httpOnly, secure (in production), sameSite cookies
- **Password Security**: bcrypt hashing with salt rounds

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-reload (nodemon)
- `npm run db:seed` - Manually seed the database with demo users
- `npm run db:backup` - Create a database backup SQL dump

## Test user

- Login: `admin`
- Password: `password123`
