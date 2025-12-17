# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of telegram-notify action
- Support for deployment status notifications
- Customizable emojis for success/failure
- Multi-module and multi-app deployment support
- HTML/Markdown formatting support
- Additional info field for custom data
- Comprehensive documentation and examples
- Test workflow for validation

### Features
- Basic notification with status, environment, and commit info
- Optional module and app name for complex deployments
- Commit author display (first name only)
- Automatic commit SHA shortening (7 characters)
- Configurable parse modes (HTML, Markdown, MarkdownV2)
- Output for notification success status

## [1.0.0] - TBD

Initial public release.

### Added
- telegram-notify action with full feature set
- Complete documentation
- Usage examples for various deployment scenarios
- Test suite with multiple test cases

---

## How to Use This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

## Version Tags

To use a specific version in your workflows:

```yaml
# Use latest (main branch)
uses: totoro-light/github-actions/telegram-notify@main

# Use specific version tag (recommended for production)
uses: totoro-light/github-actions/telegram-notify@v1.0.0

# Use specific commit (most stable)
uses: totoro-light/github-actions/telegram-notify@abc1234
```

