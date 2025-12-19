# GitHub Actions

[![Test Actions](https://github.com/totoro-light/github-actions/actions/workflows/test.yml/badge.svg)](https://github.com/totoro-light/github-actions/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Custom reusable GitHub Actions for deployment workflows. Use these actions in any repository to streamline your CI/CD pipeline.

## Available Actions

### 🔍 detect-changes

Detect changed modules in a monorepo by analyzing git diffs, or use manually specified modules.

**Quick Start:**

```yaml
- name: Detect changed modules
  id: detect
  uses: totoro-light/github-actions/detect-changes@main

- name: Deploy changed modules
  if: steps.detect.outputs.has-changes == 'true'
  run: |
    echo "Modules to deploy: ${{ steps.detect.outputs.deploy-modules }}"
```

**Documentation:** See [detect-changes/README.md](./detect-changes/README.md)

### 📱 telegram-notify

Send deployment status notifications to Telegram with beautiful formatting.

**Quick Start:**

```yaml
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

**Documentation:** See [telegram-notify/README.md](./telegram-notify/README.md)

**Live Example:** Check out our [test workflow](./.github/workflows/test.yml) for more examples

## Quick Setup

### 1. Create a Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Copy your bot token (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID

**For personal chat:**
1. Message your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":123456789}` in the response

**For group chat:**
1. Add your bot to a group
2. Send a message in the group
3. Visit the same URL above
4. Look for the negative ID like `-987654321`

### 3. Add Secrets to Your Repository

In your repository, go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these two secrets:
- Name: `TELEGRAM_BOT_TOKEN` → Value: Your bot token
- Name: `TELEGRAM_CHAT_ID` → Value: Your chat ID

### 4. Use in Your Workflow

Add this to your `.github/workflows/deploy.yml`:

```yaml
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

That's it! You'll now receive Telegram notifications for your deployments. 🎉

## More Examples

Check out the [test workflow](./.github/workflows/test.yml) for live examples including:
- Basic notifications
- Module-specific deployments
- Multi-app deployments
- Matrix strategies
- Custom emojis and additional info

For complete documentation and all available options, see [telegram-notify/README.md](./telegram-notify/README.md)

## Testing

See [TESTING.md](./TESTING.md) for information about running tests.

**Quick test:**
- Go to [Actions tab](https://github.com/totoro-light/github-actions/actions) → "Test Telegram Notification Action" → Run workflow

## License

MIT
