# Schedulo

- Self-hosted alternative to existing meeting scheduler tools, such as Doodle.
- Allows organisers to propose slots for a meeting.
- Organisers can send out meeting URL to participants.
- Participants indicate when they are available (no need for end user accounts).
- One admin account with preset default password.
- Simple admin interface for managing organiser accounts.


## Prerequisites

- **Node.js** 20 or higher
- **pnpm** 8.15.9 or higher

If you don't have pnpm installed:
```bash
npm install -g pnpm
```

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:IAWeb-2025-G3/Schedulo.git
   cd Schedulo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000)

### Create and Run a Production Build

  ```bash
  pnpm build
  pnpm start
  ```

  If you encounter problems while building the application, make sure you run your terminal as admin.

### Docker Deployment

Run the application using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the application on port 3000
- Create a persistent volume for poll data at `/data`

To stop the application:
```bash
docker-compose down
```

### Environment Variables

The application is enforcing the following environment variables that need to be set:
- `ADMIN_PASSWORD` (string):  
 Default admin password for the application.
- `ORGANIZER_SESSION_SECRET` (string):  
 Secret key used to sign and verify session cookies. Should be a long, random string. Example:
  ```bash
  # Generate a secure random secret (Unix/Mac/Git Bash):
  openssl rand -base64 32
  
  # Or use any random string with at least 32 characters:
  ORGANIZER_SESSION_SECRET=my-super-secret-random-string-with-min-32-chars
  ```
- `NODE_ENV` ("`development`", "`test`" or "`production`"):  
Determines the runtime environment. This is automatically set by Next.js when using `pnpm dev` ("`development`") or `pnpm start` ("`production`"). For manual deployments, it needs to be set explicitly in the environment or `.env` file.

## Alternative Deployment

For production environments requiring higher availability and scalability, consider these alternatives:

#### Cloud Storage with AWS S3 Bucket

Store poll data in Amazon S3 for improved persistence and scalability.

Requires modifying the data persistence layer to use AWS SDK for S3 instead of local file system operations.

#### Cloud Provider with Docker Volume Support

Deploy on managed container platforms such as AWS ECS, Google Cloud Run or Azure Container Instances.

Use platform-specific volume mounting for the `/data` directory or integrate with cloud storage services for enhanced durability.

## License

See [LICENSE](LICENSE) file for details.
