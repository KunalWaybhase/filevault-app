# 🔐 FileVault — Secure Cloud File Sharing

A full-stack cloud file sharing application built with Node.js and AWS.

## Features
- User registration and login with JWT authentication
- Upload files (PDF and images, max 5MB)
- Files stored on AWS S3 cloud storage
- User-specific file access
- Download and delete files
- Dark/Light theme toggle
- Drag and drop upload

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MySQL (local), AWS RDS (production) |
| File Storage | AWS S3 |
| Authentication | JWT + bcrypt |
| Frontend | HTML, CSS, Vanilla JS |
| Deployment | AWS Elastic Beanstalk |

## Project Status
- [x] Phase 1 - Local server setup
- [x] Phase 2 - File upload with restrictions
- [x] Phase 3 - MySQL database
- [x] Phase 4 - JWT Authentication
- [x] Phase 5 - AWS S3 integration
- [ ] Phase 6 - AWS Deployment (coming soon)

## Setup Instructions
1. Clone the repo
2. Run `npm install`
3. Create `.env` file with your credentials
4. Run `npm run dev`
