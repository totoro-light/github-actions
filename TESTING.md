# Testing Guide

This document explains how to test the Telegram notification action.

## Automated Tests

The repository includes automated tests that run on every push and pull request.

### Test Workflow

Location: `.github/workflows/test.yml`

**Tests include:**
- ✅ Basic notification (success)
- ✅ Notification with module name
- ✅ Notification with app and module
- ✅ Failure notification
- ✅ Notification with additional info
- ✅ Matrix deployment simulation
- ✅ Action metadata validation
- ✅ YAML syntax validation

### Running Tests

Tests run automatically on:
- Push to main/master branch
- Pull requests
- Manual trigger via workflow dispatch

**Manual test:**
1. Go to Actions tab in GitHub
2. Select "Test Telegram Notification Action"
3. Click "Run workflow"
4. Choose test status (success/failure)
5. Click "Run workflow"

## Prerequisites

Before running tests, add these secrets to your repository:

1. **TELEGRAM_BOT_TOKEN** - Your Telegram bot token
2. **TELEGRAM_CHAT_ID** - Your Telegram chat ID

### How to Get Secrets

#### 1. Create Telegram Bot
```bash
# Message @BotFather on Telegram
/newbot

# Follow instructions and save the token
```

#### 2. Get Chat ID
```bash
# Start chat with your bot or add to group
# Send a test message
# Visit this URL (replace YOUR_BOT_TOKEN):
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates

# Find "chat":{"id": YOUR_CHAT_ID}
```

#### 3. Add to GitHub
```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

## Manual Testing

### Test Locally (using act)

Install [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# Create .secrets file
cat > .secrets << EOF
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
EOF

# Run tests
act -j test-basic --secret-file .secrets
```

### Test in Real Repository

1. Fork or clone this repository
2. Add secrets to your repository
3. Push a change or create a PR
4. Check Telegram for notifications
5. Verify all test jobs pass

## What to Test

### Basic Functionality
- [x] Notification is sent
- [x] Success emoji appears correctly
- [x] Failure emoji appears correctly
- [x] Commit hash is shortened (7 chars)
- [x] Environment name is displayed

### Optional Fields
- [x] Module name appears when provided
- [x] App name appears when provided
- [x] Author name is shortened correctly
- [x] Additional info is included

### Edge Cases
- [x] Works with no module name
- [x] Works with no app name
- [x] Works with no author
- [x] Works with no additional info
- [x] Works in matrix builds
- [x] HTML characters are escaped properly

## Troubleshooting

### Test fails: "Unable to resolve action"
- Check that action.yml exists in `telegram-notify/` directory
- Verify YAML syntax is valid

### No notification received
- Verify secrets are set correctly
- Check bot token is valid
- Confirm chat ID is correct
- Ensure bot is added to the chat/group

### Notification format is wrong
- Check `parse_mode` is set to 'HTML' (default)
- Verify special characters are URL encoded (%0A for newlines)

### Action validation fails
- Run: `js-yaml telegram-notify/action.yml`
- Check for syntax errors
- Ensure all required fields are present

## Test Checklist

Before releasing a new version:

- [ ] All automated tests pass
- [ ] Manual test workflow succeeds
- [ ] Notification appears in Telegram
- [ ] Success notification looks correct
- [ ] Failure notification looks correct
- [ ] Module name displays properly
- [ ] Author name displays properly
- [ ] Custom emojis work
- [ ] Additional info appears correctly
- [ ] README is up to date
- [ ] No sensitive data in examples

## Continuous Integration

The test workflow ensures:
1. **Code Quality** - YAML validation
2. **Functionality** - Multiple test scenarios
3. **Compatibility** - Matrix testing
4. **Documentation** - README exists

All tests must pass before merging PRs.

## Contributing

When contributing changes:
1. Add tests for new features
2. Ensure all tests pass
3. Update documentation
4. Test manually with workflow dispatch
