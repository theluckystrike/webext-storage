# Contributing to webext-storage

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## How to Report Issues

- Use the [GitHub Issues](https://github.com/theluckystrike/webext-storage/issues) page to report bugs or request features.
- Check existing issues before opening a new one to avoid duplicates.
- Use the provided issue templates (Bug Report or Feature Request) when applicable.

## Development Workflow

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/webext-storage.git
   cd webext-storage
   ```
3. **Create a branch** for your change:
   ```bash
   git checkout -b my-feature
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Make your changes** and ensure tests pass:
   ```bash
   npm test
   ```
6. **Commit** your changes with a clear, descriptive commit message.
7. **Push** your branch to your fork:
   ```bash
   git push origin my-feature
   ```
8. **Open a Pull Request** against the `main` branch of this repository.

## Pull Request Guidelines

- Keep PRs focused on a single change.
- Include a clear description of what the PR does and why.
- Ensure all tests pass before requesting a review.
- Update documentation if your change affects public APIs.

## Code Style

- Write TypeScript with strict type checking enabled.
- Follow the existing code conventions in the project.
- Use meaningful variable and function names.
- Add JSDoc comments for public APIs.

## Running Tests

```bash
npm test
```

All contributions must pass the existing test suite. If you add new functionality, please include corresponding tests.

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.
