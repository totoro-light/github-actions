# Contributing to GitHub Actions

Thank you for considering contributing to this project! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear title and description
- Steps to reproduce the bug
- Expected vs actual behavior
- Your workflow file (sanitized)
- Any relevant error messages

### Suggesting Enhancements

We welcome feature requests! Please open an issue with:
- A clear description of the feature
- Use cases and examples
- Why this would be useful to others

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/totoro-light/github-actions.git
   cd github-actions
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Update documentation as needed
   - Add tests if applicable

4. **Test your changes**
   - Run the test workflow locally if possible
   - Ensure all existing tests pass
   - Add new test cases for your changes

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `test:` - Test updates
   - `chore:` - Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Wait for review and address feedback

## Development Guidelines

### Action Development

When modifying or creating actions:

1. **Keep it simple** - Actions should do one thing well
2. **Document everything** - All inputs, outputs, and behaviors
3. **Handle errors gracefully** - Provide clear error messages
4. **Test thoroughly** - Add test cases to the test workflow
5. **Follow conventions** - Use consistent naming and structure

### Documentation

- Use clear, concise language
- Provide working examples
- Keep examples up to date
- Include real-world use cases

### Testing

Before submitting a PR:

1. Test your action locally if possible
2. Add test cases to `.github/workflows/test.yml`
3. Ensure all tests pass
4. Test with different inputs and scenarios

## Code Style

- Use shell best practices for bash scripts
- Format YAML with 2-space indentation
- Keep lines under 120 characters when possible
- Use meaningful variable names
- Add comments for complex logic

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── test.yml          # Test workflow
├── telegram-notify/
│   ├── action.yml            # Action definition
│   └── README.md             # Action documentation
├── CHANGELOG.md              # Version history
├── CONTRIBUTING.md           # This file
├── EXAMPLES.md               # Usage examples
├── LICENSE                   # MIT License
├── README.md                 # Main documentation
└── TESTING.md                # Testing guide
```

## Adding a New Action

To add a new action to this repository:

1. Create a new directory with the action name
2. Add `action.yml` with the action definition
3. Add `README.md` with documentation
4. Add test cases to `.github/workflows/test.yml`
5. Update the main `README.md`
6. Add usage examples to `EXAMPLES.md`

Example structure:
```
new-action/
├── action.yml
└── README.md
```

## Questions?

Feel free to open an issue if you have questions about contributing!

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## Recognition

Contributors will be recognized in:
- Release notes
- GitHub contributors page
- Special thanks in documentation updates

Thank you for contributing! 🚀

