<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/database.svg" width="80" height="80" alt="PgProvision Logo" />
  <h1>PgProvision</h1>
  <p>An internal platform to instantly provision isolated PostgreSQL databases via Docker.</p>

  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started-local">Local Setup</a> •
    <a href="#deploying-to-production">Production Deployment</a>
  </p>
</div>

---

## 🚀 What is PgProvision?

PgProvision is a full-stack internal tooling platform designed for development teams. Instead of manually installing PostgreSQL locally or dealing with shared database conflicts, developers can use this platform to instantly spin up **isolated PostgreSQL instances** in Docker containers. 

It provides an elegant, premium dashboard to monitor container health, database size, active connections, and table schemas, along with instant connection strings.

## ✨ Features

- **Instant Provisioning**: One-click creation of new PostgreSQL 15 databases.
- **True Isolation**: Every provisioned database runs in its own dedicated Docker container with persistent volumes.
- **Admin & User Management**: 
  - The first registered user automatically becomes the **Admin**.
  - Subsequent public registrations are locked to maintain security.
  - Admins can provision new developer accounts directly from the UI.
- **Role-Based Visibility**: Developers only see the databases they own. Admins have a global view of all databases across the team.
- **Interactive Schema Viewer**: Deep integration with `information_schema`. Instantly view tables, columns, data types, primary keys, and live indexes right from the dashboard.
- **Live Metrics**: Monitor container running status, mapped ports, and approximate table row counts.
- **Modern Tech Stack**: Fastify (Node.js) backend and a stunning Next.js 14 frontend featuring glassmorphism, fluid animations, and a responsive grid layout.

## 🏗 Architecture

The platform consists of three main parts, effectively routing developers to Docker-orchestrated containers:
```text
Developer 
  ↳ Web Dashboard (Next.js) 
      ↳ Provisioning API (Fastify) 
          ↳ Docker Socket (dockerode) 
              ↳ Isolated PostgreSQL Containers
```

## 🏁 Getting Started (Local)

### 1. Start the Platform Metadata Database
PgProvision requires a core database to keep track of users and the containers it provisions.
```bash
docker-compose up -d
```
*(This starts a container named `pgprov_platform_db` on port `5434`)*

### 2. Configure & Run Backend
Navigate to the backend directory, install dependencies, run migrations to set up the scheme, and start the development server.
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start the Fastify API (runs on port 3001)
npm run dev
```

### 3. Configure & Run Frontend
In a new terminal, start the Next.js frontend.
```bash
cd frontend
npm install

# Copy environment variables
cp .env.example .env.local

# Start the app (runs on port 3000)
npm run dev
```

### 4. Setup your First Admin Account
1. Open your browser and go to `http://localhost:3000/register`.
2. Create an account. **Because you are the first user, you will automatically be granted the Admin role.**

---

## 🚢 Deploying to Production (Linux Ubuntu Server)

To deploy PgProvision for your internal team on a VPS (AWS EC2, DigitalOcean, Linode), follow these steps to configure Node.js, Docker permissions, and PM2.

### Step 1: Server Preparation
SSH into your Ubuntu 22.04 server and install the core dependencies:
```bash
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker & Docker Compose
sudo apt install docker.io docker-compose -y

# Install PM2 globally (Production Process Manager)
sudo npm install -g pm2
```

### Step 2: Critical Docker Permissions
Because the Fastify backend needs to create Docker containers on the host, the Linux user running the backend process **must** have Docker permissions.
```bash
sudo usermod -aG docker $USER
```
> **⚠️ Important:** After running this command, type `exit` to logout of SSH, and then SSH back in. Otherwise, the permission change will not take effect.

### Step 3: Clone Code & Start Metadata DB
```bash
git clone <your-github-repo-url> pgprovision
cd pgprovision
docker-compose up -d
```

### Step 4: Build & Start Backend
```bash
cd backend
npm install
npm run build

# Configure Production .env
cp .env.example .env
nano .env
```
Inside `.env`, ensure you set `PROVISIONED_DB_HOST` to your server's public IP address so the Next.js dashboard gives developers the correct connection string:
```env
PROVISIONED_DB_HOST=<YOUR_SERVER_PUBLIC_IP>
```
Run the migrations and start the backend with PM2:
```bash
npm run migrate
pm2 start dist/index.js --name "pgprov-backend"
```

### Step 5: Build & Start Frontend
```bash
cd ../frontend
npm install

# Configure Production .env.local
echo "NEXT_PUBLIC_API_URL=http://<YOUR_SERVER_PUBLIC_IP>:3001" > .env.local

npm run build
pm2 start npm --name "pgprov-frontend" -- start
```

### Step 6: Save PM2 State
To ensure PgProvision automatically powers back on if your server restarts:
```bash
pm2 save
pm2 startup
# Paste and run the command that PM2 spits out!
```

### Step 7: Configure Firewall
Ensure your server's security group or Uncomplicated Firewall (`ufw`) allows traffic on the required ports:
```bash
sudo ufw allow 22/tcp       # SSH
sudo ufw allow 3000/tcp     # Next.js Frontend
sudo ufw allow 3001/tcp     # Fastify Backend API
sudo ufw allow 5435:5535/tcp # PgProvision generated database ports
sudo ufw enable
```

### Optional: Reverse Proxy with SSL (Nginx)
For a professional internal deployment:
1. Point your sub-domain to the Server's IP.
2. Install Nginx (`sudo apt install nginx`).
3. Set up a reverse proxy forwarding port `80` to `localhost:3000`.
4. Install `certbot` to provision a free Let's Encrypt SSL certificate.

## 🔐 Security Context
This tool maps newly provisioned PostgreSQL containers to open ports on the host machine. It is strongly recommended to restrict port access (e.g. `5435-5535`) in your AWS Security Group strictly to your team's VPN/office IP addresses rather than leaving them open to the public internet `$0.0.0.0/0`. This tool is intended primarily as an internal staging database multiplier, not for highly sensitive production storage.

---
*Built with ❤️ using Next.js, Fastify, Docker, and PostgreSQL.*
