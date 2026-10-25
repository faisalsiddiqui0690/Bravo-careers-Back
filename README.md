# Backend Email Service

This directory contains the backend email service for handling contact form submissions.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env` and update with your credentials:
```bash
cp .env.example .env
```

Update the following in `.env`:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: Your Gmail App Password (not regular password)
- `OWNER_EMAIL`: Email address to receive contact form inquiries

### 3. Generate Gmail App Password
1. Enable 2-Step Verification in your Google Account
2. Visit https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Copy the 16-character password to `.env`

## Running the Server

### Production Mode
```bash
npm start
```

### Development Mode (with auto-reload)
First, install nodemon globally:
```bash
npm install -g nodemon
```

Then run:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/send-email
Send a contact form email.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "service": "Web Development",
  "message": "I have a project..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emails sent successfully"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Email service is running"
}
```

## How It Works

When a contact form is submitted:

1. **Email to Owner**: Sends detailed inquiry to the business owner
2. **Auto-Reply to Customer**: Sends confirmation email to the person who filled out the form

Both emails are sent simultaneously using Nodemailer with professional HTML templates.

## Project Structure

```
server/
├── index.js          # Main server file
├── .env              # Environment variables (create from .env.example)
├── .env.example      # Example environment file
├── .gitignore        # Git ignore file
└── package.json      # Dependencies and scripts
```

## Troubleshooting

### Invalid Login Error
- Ensure you're using the App Password, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check `.env` file has correct credentials

### Connection Timeout
- Check if EMAIL_HOST and EMAIL_PORT are correct
- Ensure firewall allows connections on port 587

### Port Already in Use
- Change the PORT value in `.env` to a different port (e.g., 5001)
- Update the frontend API call to use the new port
