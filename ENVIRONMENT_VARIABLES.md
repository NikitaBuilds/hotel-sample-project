# Environment Variables Setup

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (for invitations)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Email Sender Info
EMAIL_FROM_NAME=Ski Trip Planner
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
```

## Email Setup Instructions

### Using Gmail

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use your Gmail address for `SMTP_USER`
4. Use the generated app password for `SMTP_PASS`

### Using Other Providers

**SendGrid:**

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Mailgun:**

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_smtp_user
SMTP_PASS=your_mailgun_smtp_password
```

## Production Considerations

- Use a dedicated email service (SendGrid, Mailgun, etc.) for production
- Set up proper DNS records (SPF, DKIM, DMARC) for better deliverability
- Use environment-specific URLs for `NEXT_PUBLIC_APP_URL`
- Consider using environment secrets management in production
