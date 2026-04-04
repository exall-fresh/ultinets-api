# Ultinets CMS Backend

A complete Express.js API for the Ultinets Content Management System (CMS) with MySQL/MariaDB database via Prisma ORM.

## Features

- **Authentication**: JWT-based auth with access tokens (15min) and refresh tokens (7 days)
- **Role-Based Access Control (RBAC)**: Admin, Editor, and Viewer roles
- **Data Management**: Services, Team Members, Partners
- **Contact Form**: Public submissions with admin management
- **Media Management**: File uploads with multer
- **Activity Logging**: Track all admin actions
- **Site Settings**: Dynamic configuration

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/ultinets_cms"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this"
PORT=4000
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=public/uploads
```

### 3. Database Setup

#### Prerequisites

You need **MySQL 8.0+** or **MariaDB 10.5+** installed on your system.

**Windows Options:**
- [XAMPP](https://www.apachefriends.org/) (Recommended - includes MySQL + phpMyAdmin)
- [WAMP](https://www.wampserver.com/)
- MySQL Community Server

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

#### Step 3.1: Create the Database

**Option A: Using phpMyAdmin (XAMPP/WAMP)**
1. Start Apache and MySQL from the XAMPP Control Panel
2. Open browser: `http://localhost/phpmyadmin`
3. Click "New" to create a database
4. Enter database name: `ultinets_cms`
5. Select collation: `utf8mb4_unicode_ci`
6. Click "Create"

**Option B: Using MySQL Command Line**
```bash
# Open MySQL terminal (Windows: use XAMPP Shell or MySQL Command Line Client)
mysql -u root -p

# Create database with UTF-8 support
CREATE DATABASE ultinets_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create a dedicated user (recommended for production)
CREATE USER 'ultinets_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON ultinets_cms.* TO 'ultinets_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

**Option C: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Click "Create a new schema" (database icon)
4. Enter name: `ultinets_cms`
5. Charset: `utf8mb4`
6. Collation: `utf8mb4_unicode_ci`
7. Click "Apply"

#### Step 3.2: Configure Database Connection

Edit the `.env` file with your database credentials:

```env
# For XAMPP (default root, no password)
DATABASE_URL="mysql://root:@localhost:3306/ultinets_cms"

# For custom user
DATABASE_URL="mysql://ultinets_user:your_password@localhost:3306/ultinets_cms"

# For production with SSL
DATABASE_URL="mysql://user:password@host:3306/ultinets_cms?sslaccept=strict"
```

**Connection string format:**
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE?options
```

#### Step 3.3: Run Prisma Setup

```bash
# Generate Prisma client (creates TypeScript types from schema)
npx prisma generate

# Run migrations (creates database tables)
npx prisma migrate dev --name init
```

**What this does:**
- Creates all tables (users, services, team, partners, contacts, media, etc.)
- Sets up foreign key relationships
- Creates indexes for performance

**Troubleshooting:**
- If you get `P1001: Can't reach database server` → MySQL is not running
- If you get `P3005: Database already exists` → Database already created, skip to migrations
- If you get authentication errors → Check username/password in DATABASE_URL

#### Step 3.4: Seed Database (Optional)

```bash
# Populate database with sample data
npm run db:seed
```

**This creates:**
- Admin user: `admin@ultinets.com` / `admin123`
- Editor user: `editor@ultinets.com` / `editor123`
- Sample services (Web Development, Cloud Solutions)
- Sample team members
- Sample partners
- Default site settings

#### Step 3.5: Verify Database Setup

```bash
# View database in Prisma Studio (GUI)
npx prisma studio
```

Opens at `http://localhost:5555` - you can browse and edit data.

**Or test via API:**
```bash
# Should return empty array [] initially
curl http://localhost:4000/api/services
```

### 4. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server runs at: `http://localhost:4000`

---

## API Documentation

### Authentication

All admin routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "admin"  // admin, editor, or viewer
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/auth/logout
```

---

### Public API Endpoints (No Authentication Required)

These endpoints are for the frontend website to fetch content:

#### Services
```http
GET /api/services           # List all published services
GET /api/services/:slug     # Get single service by slug
```

#### Team Members
```http
GET /api/team               # List all published team members
```

#### Partners
```http
GET /api/partners           # List all published partners
```

#### Contact Form Submission
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Inquiry",
  "message": "I would like to know more about your services.",
  "service": "consulting",
  "captchaToken": "..."
}
```

#### Site Settings
```http
GET /api/settings           # Get all site settings as key-value object
```

---

### Admin API Endpoints (Authentication Required)

All admin endpoints require the `Authorization: Bearer <token>` header.

#### Services Management
```http
GET    /api/admin/services              # List all services
GET    /api/admin/services/:id          # Get service by ID
POST   /api/admin/services              # Create new service
PUT    /api/admin/services/:id          # Update service
DELETE /api/admin/services/:id          # Delete service (admin only)
PATCH  /api/admin/services/:id/publish   # Publish/unpublish service
POST   /api/admin/services/:id/upload-image  # Upload service image
```

**Service Create/Update Body:**
```json
{
  "slug": "web-development",
  "serviceName": "Web Development",
  "description": "We build modern websites",
  "fullDescription": "Detailed service description...",
  "icon": "code",
  "metaTitle": "Web Development Services",
  "metaDescription": "Professional web development",
  "published": true,
  "order": 1
}
```

**Upload Image:**
```http
POST /api/admin/services/:id/upload-image
Content-Type: multipart/form-data

image: <file>
```

#### Team Management
```http
GET    /api/admin/team                 # List all team members
POST   /api/admin/team                 # Create team member
PUT    /api/admin/team/:id             # Update team member
DELETE /api/admin/team/:id             # Delete team member (admin only)
POST   /api/admin/team/:id/upload-photo # Upload member photo
```

**Team Member Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "position": "CEO",
  "email": "john@company.com",
  "phone": "+1234567890",
  "bio": "John has 10 years of experience...",
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe"
  },
  "published": true,
  "order": 1
}
```

#### Partners Management
```http
GET    /api/admin/partners              # List all partners
POST   /api/admin/partners              # Create partner
PUT    /api/admin/partners/:id          # Update partner
DELETE /api/admin/partners/:id          # Delete partner (admin only)
POST   /api/admin/partners/:id/upload-logo  # Upload partner logo
```

**Partner Body:**
```json
{
  "name": "Tech Corp",
  "description": "Leading technology partner",
  "website": "https://techcorp.com",
  "category": "Technology",
  "published": true,
  "order": 1
}
```

#### Contact Submissions (Admin)
```http
GET    /api/admin/contacts              # List all submissions
GET    /api/admin/contacts/:id          # Get single submission
PATCH  /api/admin/contacts/:id/status    # Update status (new, read, responded, spam)
DELETE /api/admin/contacts/:id          # Delete submission (admin only)
```

**Status Update:**
```json
{
  "status": "responded"
}
```

#### Media Management
```http
GET    /api/admin/media                # List all uploaded media
POST   /api/admin/media/upload         # Upload new file
DELETE /api/admin/media/:id            # Delete media (admin only)
```

**Upload File:**
```http
POST /api/admin/media/upload
Content-Type: multipart/form-data

file: <file>
altText: "Description of image"
```

**Response:**
```json
{
  "id": 1,
  "filename": "image.jpg",
  "url": "/uploads/1234567890-image.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "altText": "Description",
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Settings Management
```http
GET    /api/admin/settings             # List all settings with metadata
PUT    /api/admin/settings/:key         # Create or update setting
```

**Update Setting:**
```http
PUT /api/admin/settings/siteName
Content-Type: application/json

{
  "value": "Ultinets CMS",
  "type": "string"  // string, text, number, boolean
}
```

#### Activity Logs
```http
GET /api/admin/logs                    # Get recent activity logs (admin only)
```

**Log Entry:**
```json
{
  "id": 1,
  "userId": 1,
  "action": "create",
  "entityType": "page",
  "entityId": 5,
  "changes": { "old": {}, "new": { "title": "About Us" } },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all endpoints |
| **editor** | Can create, update, publish content. Cannot delete or manage users. |
| **viewer** | Read-only access to admin endpoints |

---

## Database Schema

The API uses the following tables:

- **users** - Admin users with roles
- **pages** - Website pages (Home, About, etc.)
- **services** - Service offerings
- **serviceDetails** - Key features for each service
- **teamMembers** - Team/staff information
- **partners** - Partner/client logos
- **contactSubmissions** - Contact form entries
- **media** - Uploaded files
- **activityLogs** - Audit trail
- **settings** - Site configuration

See `prisma/schema.prisma` for full schema definition.

---

## File Uploads

Uploaded files are stored in `public/uploads/` and served statically at `/uploads/:filename`.

**Max file size:** 10MB

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate email)
- `500` - Internal Server Error

---

## Frontend Integration

### Example: Fetching Public Data

```javascript
// Using fetch
const response = await fetch('http://localhost:4000/api/services');
const services = await response.json();

// Get single service
const serviceResponse = await fetch('http://localhost:4000/api/services/web-development');
const service = await serviceResponse.json();
```

### Example: Admin API with Auth

```javascript
// Login
const loginRes = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
});
const { accessToken } = await loginRes.json();

// Use token for admin requests
const servicesRes = await fetch('http://localhost:4000/api/admin/services', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const adminServices = await servicesRes.json();
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma studio` | Open Prisma database GUI |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `PORT` | Server port | 4000 |
| `CORS_ORIGIN` | Allowed frontend origin | http://localhost:3000 |
| `UPLOAD_DIR` | File upload directory | public/uploads |

---

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Role-based access control
- SQL injection prevention via Prisma ORM
- File upload size limits (10MB)

---

## Next Steps

1. Set up your MySQL/MariaDB database
2. Configure environment variables
3. Run migrations to create tables
4. Register your first admin user
5. Start building the frontend!

For frontend integration examples, see the `/frontend` folder.
"# ultinets-api" 
