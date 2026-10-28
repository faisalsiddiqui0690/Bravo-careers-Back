# Bravo Careers API

This directory contains the Express and MySQL API for Bravo Careers, including contact enquiries and protected website-content administration.

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
- `SMTP_USER`: Your Gmail address
- `SMTP_PASS`: Your Gmail App Password (not regular password)
- `OWNER_EMAIL`: Email address to receive contact form inquiries
- `DB_NAME`: `bravo_careers`
- `SUPER_ADMIN_EMAIL`: initial super-admin login email; migration generates a random temporary password
- `CLOUDINARY_URL`: Cloudinary connection string for admin image uploads

Admin users can upload JPG, PNG, WebP, GIF and AVIF images (up to 5 MB) for
services, blogs and news. Images are stored in Cloudinary and their secure URLs
are saved with the content.

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

### Website content

The database migration creates the Bravo Careers schema, including `resources`
and resource-aware `enquiries`. E-books and free-resource content is seeded from
the current catalogue and can be managed in the admin area.

Public website endpoints return published content only:

- `GET /api/services`
- `GET /api/reviews`
- `GET /api/blogs`
- `GET /api/news`
- `GET /api/blogs/:slug` and `GET /api/news/:slug`

Admin content endpoints require the bearer token returned by
`POST /api/v1/admin/auth/login`:

- Services: `GET /api/services/admin/all`, `POST /api/services`,
  `PUT /api/services/:id`, `DELETE /api/services/:id`
- Testimonials: `GET /api/reviews/admin/all`, and the corresponding `POST`,
  `PUT /:id`, and `DELETE /:id` operations
- Blogs and news: `GET /api/{blogs|news}/admin/all`, and corresponding `POST`,
  `PUT /:id`, and `DELETE /:id` operations

Content can be saved as a draft or published. The website only exposes published
records, and the admin UI can edit or remove drafts and published records.
Testimonials additionally require recorded client permission before they can be
published; no sample or fabricated testimonial quotes are seeded.
Run `npm run migrate` to create/update the schema and seed Bravo Careers services,
editorial content and resources. The normal migration does not drop existing data.

To deliberately recreate the `bravo_careers` database, set
`RESET_DATABASE=bravo_careers` for the command and run `npm run reset-db`.
This drops all data and tables in that database before migrating it again. It
refuses to reset any other database name; back up required data first.

When `SUPER_ADMIN_EMAIL` is set and no super admin exists, the migration run
(including the migration invoked by `npm run dev`) creates the
`adminbravocareers` super admin with a random temporary password. That password
is printed once during account creation; save it and change it after signing in.
Subsequent migrations do not reset or print the password again.
To change an existing super-admin password, set `ADMIN_NEW_PASSWORD` for a
single `npm run admin:set-password` invocation. Never commit passwords or leave
them in shared configuration.

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
