# GearGuard Server

FastAPI backend with PostgreSQL database running in Docker.

## Prerequisites

- Docker
- Docker Compose

### WSL2 Users (Windows)

**📖 For detailed WSL2 setup instructions, see [WSL2_SETUP.md](WSL2_SETUP.md)**

Quick checklist:

1. **Ensure Docker Desktop is installed** on Windows with WSL2 backend enabled
2. **Clone the repository inside WSL2 filesystem** (e.g., `~/Projects/`) NOT in `/mnt/c/`
3. **Use WSL2 terminal** (Ubuntu, Debian, etc.) for all Docker commands
4. Docker Desktop should automatically integrate with your WSL2 distro

Why clone in WSL2 filesystem?
- File I/O is much faster (~2-5x)
- Avoids cross-filesystem permission issues
- Better compatibility with Linux-based containers

## Setup

### Quick Setup (Recommended)

Run the automated setup script:
```bash
./setup.sh
```

This script will:
- Check if Docker and Docker Compose are installed
- Create the `.env` file from `.env.example`
- Set up the `postgres_data` directory with proper permissions
- Build and start all containers
- Test the API endpoint

### Manual Setup

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if you want to change default credentials.

2. **Create postgres_data directory:**
   ```bash
   mkdir -p postgres_data && chmod 777 postgres_data
   ```

3. **Build and start the containers:**
   ```bash
   docker-compose up --build
   ```

   For detached mode:
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Docker Commands

### Start services
```bash
docker-compose up
```

### Stop services
```bash
docker-compose down
```

### Stop services and remove volumes (WARNING: deletes database data)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f api  # API logs
docker-compose logs -f db   # Database logs
```

### Rebuild after code changes
```bash
docker-compose up --build
```

### Execute commands in containers
```bash
# Access API container
docker-compose exec api bash

# Access PostgreSQL
docker-compose exec db psql -U gearguard -d gearguard_db
```

## Database Persistence

The PostgreSQL data is stored in a local `postgres_data/` directory (bind mount). This approach:
- ✅ Works consistently across Linux, macOS, and WSL2
- ✅ Survives container restarts and rebuilds
- ✅ Easy to backup (just copy the directory)
- ✅ Compatible with FUSE filesystems and custom Docker storage locations

The data will persist until you:
1. Run `docker-compose down -v` (removes volumes), or
2. Manually delete the `postgres_data/` directory

**Note:** The `postgres_data/` directory is ignored by git (see `.gitignore`).

## Development

The code is mounted as a volume, so changes to Python files will automatically reload the server (thanks to `--reload` flag in uvicorn).

## Troubleshooting

### Database Permission Issues

If you encounter permission errors with PostgreSQL:

1. **Ensure `postgres_data/` has proper permissions:**
   ```bash
   chmod 777 postgres_data/
   ```

2. **For WSL2 users:** Make sure you're working in the WSL2 filesystem (e.g., `~/Projects/`), not in the Windows filesystem (`/mnt/c/`).

3. **Clean restart:**
   ```bash
   docker-compose down -v
   rm -rf postgres_data/
   mkdir -p postgres_data && chmod 777 postgres_data
   docker-compose up -d
   ```

### Container Not Starting

1. **Check logs:**
   ```bash
   docker-compose logs db
   docker-compose logs api
   ```

2. **Verify ports are not in use:**
   ```bash
   lsof -i :8000  # API port
   lsof -i :5432  # PostgreSQL port
   ```

3. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Project Structure

```
server/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── Dockerfile          # Container configuration
├── docker-compose.yml  # Multi-container orchestration
├── setup.sh            # Automated setup script
├── .dockerignore       # Files to exclude from Docker
├── .env.example        # Environment variables template
├── postgres_data/      # PostgreSQL data (auto-created, gitignored)
└── README.md          # This file
```
