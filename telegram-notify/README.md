# Telegram Deployment Notification Action

A reusable GitHub Action for sending deployment status notifications to Telegram.

[![Test Actions](https://github.com/totoro-light/github-actions/actions/workflows/test.yml/badge.svg)](https://github.com/totoro-light/github-actions/actions/workflows/test.yml)

## Features

- ✅ Simple, clean notification format
- 🎨 Customizable emojis
- 📦 Automatic commit hash shortening
- 🏗️ Support for multi-module and multi-app deployments
- 🔄 HTML/Markdown formatting support
- 📊 Additional info field for custom data
- 🚀 Easy to integrate with any deployment workflow

## Quick Links

- 🧪 [Test Workflow](../.github/workflows/test.yml) - Live working examples
- 📖 [Main README](../README.md) - Repository overview

## Usage

### Basic Example

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Deploy your application
        run: |
          # Your deployment steps here
          echo "Deploying..."
      
      - name: Notify deployment status
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'production'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
```

### Pin to a Specific Version

For production use, it's recommended to pin to a specific commit or tag:

```yaml
- name: Notify deployment status
  if: always()
  uses: totoro-light/github-actions/telegram-notify@v1.0.0
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: 'production'
    commit_sha: ${{ github.sha }}
```

### Advanced Example with Module Name

```yaml
- name: Notify backend deployment
  if: always()
  uses: totoro-light/github-actions/telegram-notify@main
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: ${{ inputs.environment }}
    module_name: 'backend-api'
    commit_sha: ${{ github.sha }}
    commit_author: ${{ github.actor }}
    success_emoji: '🚀'
    failure_emoji: '💥'
```

### Multi-App Example

For monorepos with multiple applications:

```yaml
- name: Notify app deployment
  if: always()
  uses: totoro-light/github-actions/telegram-notify@main
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: 'staging'
    app_name: 'myapp'
    module_name: 'api'
    commit_sha: ${{ github.sha }}
    commit_author: ${{ github.actor }}
```

### Matrix Deployments

Deploy multiple modules and get notified for each:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        module: [api, web, worker]
        environment: [staging, production]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Deploy ${{ matrix.module }}
        run: |
          echo "Deploying ${{ matrix.module }} to ${{ matrix.environment }}"
      
      - name: Notify deployment
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: ${{ matrix.environment }}
          module_name: ${{ matrix.module }}
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
```

### With Additional Information

Add custom information to your notifications:

```yaml
- name: Notify with PR info
  if: always()
  uses: totoro-light/github-actions/telegram-notify@main
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: 'production'
    commit_sha: ${{ github.sha }}
    commit_author: ${{ github.actor }}
    additional_info: "🔗 PR: #${{ github.event.pull_request.number }}%0A⏱️ Duration: ${{ job.duration }}s"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `status` | Deployment status (success/failure) | Yes | - |
| `telegram_bot_token` | Telegram bot token | Yes | - |
| `telegram_chat_id` | Telegram chat ID | Yes | - |
| `environment` | Deployment environment (e.g., staging, production) | Yes | - |
| `commit_sha` | Git commit SHA | Yes | - |
| `module_name` | Name of the module being deployed | No | `''` |
| `app_name` | Name of the application (for multi-app repos) | No | `''` |
| `commit_author` | Git commit author name (will show first name only) | No | `''` |
| `success_emoji` | Emoji for success notification | No | `✅` |
| `failure_emoji` | Emoji for failure notification | No | `❌` |
| `additional_info` | Additional information to include | No | `''` |
| `parse_mode` | Telegram parse mode (HTML, Markdown, MarkdownV2) | No | `HTML` |

## Outputs

| Output | Description |
|--------|-------------|
| `notification_sent` | Whether notification was sent successfully (`true`/`false`) |

## Real-World Examples

### Docker Deployment

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t myapp:latest .
      
      - name: Push to registry
        run: docker push myapp:latest
      
      - name: Deploy to server
        run: |
          ssh user@server "docker pull myapp:latest && docker-compose up -d"
      
      - name: Notify deployment
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'production'
          module_name: 'docker-api'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
```

### Kubernetes Deployment

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
          kubectl rollout status deployment/myapp
      
      - name: Notify deployment
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'k8s-prod'
          app_name: 'myapp'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
          success_emoji: '☸️'
```

### AWS Lambda Deployment

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Lambda
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: us-east-1
      
      - name: Update Lambda function
        run: |
          zip -r function.zip .
          aws lambda update-function-code \
            --function-name my-function \
            --zip-file fileb://function.zip
      
      - name: Notify deployment
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'aws-lambda'
          module_name: 'my-function'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
          success_emoji: '🚀'
          additional_info: '☁️ AWS Lambda%0A📍 Region: us-east-1'
```

### Vercel/Netlify Deployment

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Notify deployment
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'vercel-prod'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
          additional_info: '▲ Vercel Deployment'
```

### Multi-Environment Pipeline

```yaml
jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: ./deploy.sh staging
      - name: Notify
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'staging'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
  
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: ./deploy.sh production
      - name: Notify
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'production'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
          success_emoji: '🎉'
```

## Example Notifications

### Success
```
✅ Deployment of myapp-api completed successfully!
📦 Commit: a1b2c3d
🌐 Environment: production
👤 By: Alice
```

### Failure
```
❌ Deployment of myapp-web failed!
📦 Commit: x9y8z7w
🌐 Environment: staging
👤 By: Bob
```

### With Additional Info
```
🚀 Deployment of backend-api completed successfully!
📦 Commit: 1a2b3c4
🌐 Environment: production
👤 By: John

🔗 PR: #123
⏱️ Duration: 3m 42s
```

## Setup

### 1. Create a Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow instructions
3. Save the bot token

### 2. Get Chat ID

1. Add your bot to a group or start a chat
2. Send a message to the bot
3. Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find the `chat.id` in the response

### 3. Add Secrets to Repository

Add these secrets to your repository:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Integration Guide

### Using in Your Repository

Simply reference this action in your workflow files:

```yaml
uses: totoro-light/github-actions/telegram-notify@main
```

### Version Pinning (Recommended)

For production environments, pin to a specific version:

```yaml
# Pin to a tag
uses: totoro-light/github-actions/telegram-notify@v1.0.0

# Pin to a commit SHA (most secure)
uses: totoro-light/github-actions/telegram-notify@a1b2c3d

# Use main branch (gets latest updates)
uses: totoro-light/github-actions/telegram-notify@main
```

### Complete Workflow Example

Here's a complete workflow file example:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy Application
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: |
          # Your deployment commands
          echo "Deploying to production..."
      
      - name: Notify deployment status
        if: always()
        uses: totoro-light/github-actions/telegram-notify@main
        with:
          status: ${{ job.status }}
          telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          environment: 'production'
          commit_sha: ${{ github.sha }}
          commit_author: ${{ github.actor }}
```

## License

MIT
