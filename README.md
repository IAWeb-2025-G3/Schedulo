# Schedulo

- Self-hosted alternative to existing meeting scheduler tools, such as Doodle.
- Allows organisers to propose slots for a meeting.
- Organisers can send out meeting URLs to participants.
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
   git clone <repository-url>
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

### Docker Deployment

Run the application using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the application on port 3000
- Create a persistent volume for poll data at `/data`

The application will be available at [http://localhost:3000](http://localhost:3000)

To stop the application:
```bash
docker-compose down
```


## License

See [LICENSE](LICENSE) file for details.
