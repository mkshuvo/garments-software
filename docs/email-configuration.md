# Email Configuration Guide

## Development vs Production Email Setup

### Development Environment

**MailHog is used for development and testing only.**

MailHog is configured in `docker-compose.dev.yml` to capture and display emails during development:

```yaml
mailhog:
  image: mailhog/mailhog:latest
  ports:
    - "1025:1025"   # SMTP port
    - "8025:8025"   # Web UI port
  networks:
    - garments-network
```

**Benefits for Development:**
- Captures all outgoing emails without sending them
- Web interface at http://localhost:8025 to view emails
- No risk of accidentally sending emails to real users
- Easy testing of email templates and content

### Production Environment

**⚠️ IMPORTANT: MailHog should NEVER be used in production!**

**Why MailHog is not suitable for production:**
1. **No real email delivery** - Emails are captured, not sent
2. **Lack of security features** - No authentication, encryption, or security measures
3. **No deliverability features** - No SPF, DKIM, or bounce handling
4. **Development tool only** - Not designed for production workloads

## Production Email Solutions

### Recommended Email Service Providers

#### 1. SendGrid
```json
{
  "EmailSettings": {
    "Provider": "SendGrid",
    "ApiKey": "SG.your_api_key_here",
    "FromEmail": "noreply@yourcompany.com",
    "FromName": "Your Company Name"
  }
}
```

#### 2. Amazon SES
```json
{
  "EmailSettings": {
    "Provider": "AmazonSES",
    "Region": "us-east-1",
    "AccessKey": "your_access_key",
    "SecretKey": "your_secret_key",
    "FromEmail": "noreply@yourcompany.com",
    "FromName": "Your Company Name"
  }
}
```

#### 3. Mailgun
```json
{
  "EmailSettings": {
    "Provider": "Mailgun",
    "ApiKey": "your_api_key",
    "Domain": "mg.yourcompany.com",
    "FromEmail": "noreply@yourcompany.com",
    "FromName": "Your Company Name"
  }
}
```

#### 4. Custom SMTP Server
```json
{
  "EmailSettings": {
    "Provider": "SMTP",
    "SmtpHost": "smtp.yourcompany.com",
    "SmtpPort": 587,
    "Username": "smtp_username",
    "Password": "smtp_password",
    "EnableSsl": true,
    "FromEmail": "noreply@yourcompany.com",
    "FromName": "Your Company Name"
  }
}
```

## Implementation Example

### Email Service Interface
```csharp
public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    Task<bool> SendTemplateEmailAsync(string to, string templateId, object data);
}
```

### Production Email Service Implementation
```csharp
public class ProductionEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ProductionEmailService> _logger;

    public ProductionEmailService(IConfiguration configuration, ILogger<ProductionEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            var provider = _configuration["EmailSettings:Provider"];
            
            switch (provider)
            {
                case "SendGrid":
                    return await SendViaSendGrid(to, subject, body, isHtml);
                case "AmazonSES":
                    return await SendViaAmazonSES(to, subject, body, isHtml);
                case "Mailgun":
                    return await SendViaMailgun(to, subject, body, isHtml);
                case "SMTP":
                    return await SendViaSMTP(to, subject, body, isHtml);
                default:
                    throw new InvalidOperationException($"Unknown email provider: {provider}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
            return false;
        }
    }

    // Implementation methods for each provider...
}
```

## Security Considerations

### 1. Authentication & Authorization
- Use API keys or OAuth for service authentication
- Store credentials securely (Azure Key Vault, AWS Secrets Manager)
- Rotate credentials regularly

### 2. Email Authentication
- Configure SPF records for your domain
- Set up DKIM signing
- Implement DMARC policy

### 3. Rate Limiting
- Implement email sending rate limits
- Handle service provider quotas
- Add retry logic with exponential backoff

### 4. Data Protection
- Encrypt sensitive data in email content
- Use secure connections (TLS/SSL)
- Comply with GDPR/privacy regulations

## Environment Configuration

### Development (.env.development)
```env
EMAIL_PROVIDER=MailHog
MAILHOG_HOST=mailhog
MAILHOG_PORT=1025
```

### Production (.env.production)
```env
EMAIL_PROVIDER=SendGrid
SENDGRID_API_KEY=your_production_api_key
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME=Your Company Name
```

## Monitoring & Logging

### 1. Email Delivery Monitoring
- Track sent/delivered/bounced emails
- Monitor delivery rates and performance
- Set up alerts for delivery failures

### 2. Error Handling
- Log all email sending attempts
- Implement retry mechanisms
- Handle provider-specific errors

### 3. Analytics
- Track email open rates (if applicable)
- Monitor user engagement
- Analyze delivery performance

## Migration Strategy

### From Development to Production
1. **Remove MailHog** from production docker-compose
2. **Configure production email provider** credentials
3. **Update application settings** for production email service
4. **Test email delivery** in staging environment
5. **Monitor** email delivery in production

### Example Production Docker Compose
```yaml
# Note: MailHog is completely removed from production
version: '3.8'
services:
  backend:
    # ... backend configuration
    environment:
      - EMAIL_PROVIDER=SendGrid
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
  
  # No MailHog service in production
```

## Best Practices

1. **Always test email configuration** in staging before production
2. **Use separate credentials** for different environments
3. **Implement email templates** for consistent branding
4. **Monitor delivery rates** and bounce handling
5. **Keep email provider documentation** handy for troubleshooting
6. **Set up backup email providers** for redundancy
7. **Regularly review and update** email security settings
