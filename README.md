# GitHub Actions

Custom reusable GitHub Actions for deployment workflows.

## Available Actions

### 📱 telegram-notify

Send deployment status notifications to Telegram.

**Usage:**

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
    commit_author: ${{ github.event.head_commit.author.name }}
```

**Documentation:** See [telegram-notify/README.md](./telegram-notify/README.md)

## Setup

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Get your chat ID
3. Add secrets to your repository:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

## License

MIT
