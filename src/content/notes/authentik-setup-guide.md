---
title: "Setting Up Authentik with Docker Compose"
date: "2025-04-16T23:49:42-04:00"
description: "Create a file named docker-compose.yml with the following content:"
topics:
  - docker
  - authentik
ail: 0
---
## Prerequisites

- Docker and Docker Compose installed
- A domain name for Authentik (e.g., auth.example.com)
- Basic knowledge of Docker networking

## Docker Compose Configuration

Create a file named `docker-compose.yml` with the following content:

```YAML
version: '3'

services:
  authentik-postgresql:
    image: public.ecr.aws/docker/library/postgres:16-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}"]
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 5s
    volumes:
      - authentik-database:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${PG_PASS}
      POSTGRES_USER: ${PG_USER:-authentik}
      POSTGRES_DB: ${PG_DB:-authentik}
    env_file:
      - authentik.env

  authentik-redis:
    image: public.ecr.aws/docker/library/redis:alpine
    command: --save 60 1 --loglevel warning
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
      start_period: 20s
      interval: 30s
      retries: 5
      timeout: 3s
    volumes:
      - authentik-redis:/data

  authentik-server:
    image: ghcr.io/goauthentik/server:latest
    restart: unless-stopped
    command: server
    environment:
      AUTHENTIK_REDIS__HOST: authentik-redis
      AUTHENTIK_POSTGRESQL__HOST: authentik-postgresql
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
    volumes:
      - ./media:/media
      - ./custom-templates:/templates
    env_file:
      - authentik.env
    ports:
      - "9000:9000"
      - "9443:9443"
    depends_on:
      authentik-postgresql:
        condition: service_healthy
      authentik-redis:
        condition: service_healthy

  authentik-worker:
    image: ghcr.io/goauthentik/server:latest
    restart: unless-stopped
    command: worker
    environment:
      AUTHENTIK_REDIS__HOST: authentik-redis
      AUTHENTIK_POSTGRESQL__HOST: authentik-postgresql
      AUTHENTIK_POSTGRESQL__USER: ${PG_USER:-authentik}
      AUTHENTIK_POSTGRESQL__NAME: ${PG_DB:-authentik}
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
    user: root
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./media:/media
      - ./certs:/certs
      - ./custom-templates:/templates
    env_file:
      - authentik.env
    depends_on:
      authentik-postgresql:
        condition: service_healthy
      authentik-redis:
        condition: service_healthy

volumes:
  authentik-database:
  authentik-redis:
```

## Environment Configuration

Create a file named `authentik.env`:

```plaintext
PG_PASS=your_secure_password
PG_USER=authentik
PG_DB=authentik
AUTHENTIK_SECRET_KEY=your_long_random_secret_key
AUTHENTIK_ERROR_REPORTING__ENABLED=true
```

Generate secure random values for `PG_PASS` and `AUTHENTIK_SECRET_KEY`.

## Launching Authentik

Start the containers:

```bash
docker-compose up -d
```

Access the Authentik interface at <http://localhost:9000> or <https://localhost:9443>.

## Configuring SAML Authentication

### Creating a SAML Provider

For applications that support SAML authentication (like Cloudflare Access):

1) Log in to Authentik admin  
2) Navigate to **Applications** → **Providers** → **Create**  
3) Select **SAML Provider**  

4) Configure the provider:

```plaintext
Name: [Your App Name] SAML
ACS URL: [The callback URL from your application]
Audience: [The Entity ID from your application]
Binding: Post
```

Under **Attribute Mapping**, configure:

```plaintext
email → user.email
nameID → user.email
```

Set **NameID Configuration**:

```plaintext
NameID Format: Email
NameID Property: user.email
```

Click **Save**

### Creating the Application

1) Navigate to **Applications** → **Applications** → **Create**  
2) Configure basic details:  

 ```plaintext
 Name: [Your App Name]
 Slug: [your-app-slug]
 Provider: [Select your SAML Provider]
 ```

3) Set appropriate authorization policies  
4) Click **Save**  

### Testing SAML Integration

Make sure the email attributes are correctly passed:

1) Use an email address in your user profile that matches what's expected on the service provider side.  
2) Enable debug logging in Authentik for troubleshooting.  
3) Check your email attributes are being passed correctly in the SAML assertion.  

If you encounter "**account does not have access**" errors, verify the **Name ID** format is set to **Email** and the correct email is being passed.

## Protecting Applications with Proxy Provider

For applications without native authentication support:

### Creating a Proxy Provider

1) Navigate to **Applications** → **Providers** → **Create**  
2) Select **Proxy Provider**  
3) Configure:  

 ```plaintext
 Name: [App Name] Proxy
 External Host: https://your-app-domain.com
 Internal Host: http://internal-container-name:port
 Mode: Forward auth
 ```

4) Set appropriate access settings and click **Save**

## Setting Up a Proxy Outpost

### Create a Token for Proxy Authentication

1) Navigate to **Administration** → **Tokens**  
2) Click **Create**  
3) Configure:  

 ```plaintext
 Identifier: proxy-outpost-token
 User: [Select admin user or create service account]
 Expiring: No
 Description: Token for Proxy Outpost authentication
 ```

4) Set permissions:

   - authentik_outposts.view_outpost
   - authentik_providers.view_proxyprovider

5) Save and copy the token value (**only shown once**)

## Add Proxy Outpost to Docker Compose

Add to your existing `docker-compose.yml`:

```YAML
authentik-proxy:
  image: ghcr.io/goauthentik/proxy:latest
  restart: unless-stopped
  environment:
    AUTHENTIK_HOST: https://your-authentik-domain.com
    AUTHENTIK_TOKEN: ${AUTHENTIK_TOKEN}
    AUTHENTIK_INSECURE: "false"
  networks:
    - default
    - app_network
```

Add the token to your `.env` file:

```plaintext
AUTHENTIK_TOKEN=your_token_value_here
```

## Create the Application in Authentik

1) Navigate to **Applications** → **Applications** → **Create**  
2) Configure:  

 ```plaintext
 Name: [Your App Name]
 Slug: [your-app-slug]
 Provider: [Select your Proxy Provider]
 ```

3) Set appropriate authorization policies
4) Click **Save**

## Multiple Applications with One Proxy

A single Proxy Outpost can protect multiple applications:

1) Create a separate Proxy Provider for each application  
2) Configure each with its unique external/internal hosts  
3) Create separate applications in Authentik pointing to each provider  
4) The single Proxy Outpost container will handle all applications automatically  

## Web Server Configuration

Set up your reverse proxy (like Nginx Proxy Manager) to forward application traffic to the Authentik Proxy:

```plaintext
Domain: app1.yourdomain.com
Forward to: authentik-proxy:9000

Domain: app2.yourdomain.com
Forward to: authentik-proxy:9000
```

The Authentik Proxy will handle authentication and forward authenticated requests to the appropriate internal application.

## Common Troubleshooting

- **SAML Authentication Issues**: Verify attribute mappings and NameID format
- **Proxy Access Denied**: Check application authorization policies
- **Proxy Connection Issues**: Ensure network connectivity between proxy and internal applications

