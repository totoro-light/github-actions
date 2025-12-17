# Telegram Deployment Notification Action

A reusable GitHub Action for sending deployment status notifications to Telegram.

## Features

- ✅ Simple, clean notification format
- 🎨 Customizable emojis
- 📦 Automatic commit hash shortening
- 🏗️ Support for multi-module and multi-app deployments
- 🔄 HTML/Markdown formatting support
- 📊 Additional info field for custom data

## Usage

### Basic Example

```yaml
- name: Notify deployment status
  if: always()
  uses: ./.github/actions/telegram-notify
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: 'production'
    commit_sha: ${{ github.sha }}
```

### Using from Another Repository

If you publish this action to a separate repository (e.g., `your-org/github-actions`):

```yaml
- name: Notify deployment status
  if: always()
  uses: your-org/github-actions/telegram-notify@v1
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: 'production'
    commit_sha: ${{ github.sha }}
```

### Advanced Example with Module

```yaml
- name: Notify deployment status
  if: always()
  uses: ./.github/actions/telegram-notify
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: ${{ inputs.environment }}
    module_name: ${{ matrix.module }}
    commit_sha: ${{ github.sha }}
    commit_author: ${{ github.event.head_commit.author.name }}
    success_emoji: '🚀'
    failure_emoji: '💥'
```

### Multi-App Example

```yaml
- name: Notify deployment status
  if: always()
  uses: ./.github/actions/telegram-notify
  with:
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
    environment: 'staging'
    app_name: 'myapp'
    module_name: 'api'
    commit_sha: ${{ github.sha }}
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

## Sharing Across Repositories

### Option 1: Publish to a Shared Repository

1. Create a new repository (e.g., `your-org/github-actions`)
2. Copy this action to `telegram-notify/action.yml`
3. Reference it in other repos:
   ```yaml
   uses: your-org/github-actions/telegram-notify@v1
   ```

### Option 2: Use as Git Submodule

```bash
git submodule add https://github.com/your-org/github-actions .github/shared-actions
```

Then reference:
```yaml
uses: ./.github/shared-actions/telegram-notify
```

### Option 3: Template Repository

Create a template repository with this action and use it when creating new repositories.

## License

MIT
