# Contributing

Thank you for helping improve Web Component. Bug reports, documentation fixes,
tests, and focused feature proposals are welcome.

## Before You Start

- Search existing issues and pull requests before opening a duplicate.
- Use the issue templates and include a minimal reproduction for bugs.
- Discuss substantial API or behavior changes in an issue before implementation.
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Report vulnerabilities through the private process in [SECURITY.md](SECURITY.md).

## Development

Use npm 10 or later and Node.js 22.x (22.22.2+), 24.x (24.15.0+), or 26+ for development,
as required by the jsdom test tooling. The published package retains its
Node.js 22.13.0+ runtime requirement.

```sh
npm ci
npm test
npm run lint
npm run build
```

Keep changes focused and add or update tests for behavior changes. Update the
documentation when public APIs or documented behavior change.

## Pull Requests

1. Create a branch from `main`.
2. Make a focused change with clear commit messages.
3. Run the test, lint, and build commands above.
4. Complete the pull request template and link any related issue.
5. Address review feedback and keep the branch current with `main`.

Pull requests require review before merge. By contributing, you agree that your
contribution is licensed under this project's [BSD 3-Clause License](LICENSE).
