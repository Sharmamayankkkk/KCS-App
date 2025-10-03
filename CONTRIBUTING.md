# Contributing to KCS Meet

First off, thank you for considering contributing to KCS Meet! It's people like you that make KCS Meet such a great tool for spiritual communities.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of:
- Age
- Body size
- Disability
- Ethnicity
- Gender identity and expression
- Level of experience
- Nationality
- Personal appearance
- Race
- Religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors include**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include**:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at divineconnectionkcs@gmail.com.

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible.

**Bug Report Template**:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 10]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some examples** of how it would be used
- **Include mockups** if applicable

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:
- `good-first-issue` - issues which should only require a few lines of code
- `help-wanted` - issues which should be a bit more involved

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

---

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm
- Git

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/KCS-App.git
   cd KCS-App
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Sharmamayankkkk/KCS-App.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to `http://localhost:3000`

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible
- Use descriptive variable names

**Example**:
```typescript
// Good ✅
interface MeetingData {
  id: string;
  title: string;
  startTime: Date;
  participants: string[];
}

const createMeeting = async (data: MeetingData): Promise<Meeting> => {
  // Implementation
};

// Bad ❌
const createMeeting = async (data: any): Promise<any> => {
  // Implementation
};
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

**Example**:
```tsx
// Good ✅
interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (id: string) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ 
  meeting, 
  onJoin 
}) => {
  return (
    <div>
      <h3>{meeting.title}</h3>
      <button onClick={() => onJoin(meeting.id)}>Join</button>
    </div>
  );
};
```

### File Structure

```
components/
  ├── MeetingRoom/
  │   ├── index.tsx          # Main component
  │   ├── MeetingRoom.tsx    # Component logic
  │   └── types.ts           # Type definitions
  ├── ui/                    # Reusable UI components
  └── ...
```

### Styling

- Use Tailwind CSS utility classes
- Follow existing design patterns
- Keep styles consistent
- Use CSS variables for theme colors

**Example**:
```tsx
// Good ✅
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click me
</button>

// Avoid inline styles when possible
<button style={{ padding: '8px 16px', backgroundColor: 'blue' }}>
  Click me
</button>
```

### Code Organization

- One component per file
- Group related files together
- Use barrel exports (index.ts) for cleaner imports
- Keep utilities in separate files

### Naming Conventions

- **Components**: PascalCase (e.g., `MeetingCard.tsx`)
- **Files**: kebab-case (e.g., `use-meeting-state.ts`)
- **Variables/Functions**: camelCase (e.g., `createMeeting`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PARTICIPANTS`)
- **Types/Interfaces**: PascalCase (e.g., `MeetingData`)

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(meeting): add virtual background support

- Implement background blur using TensorFlow.js
- Add background image selection
- Update meeting setup screen

Closes #123

---

fix(payment): resolve Super Chat payment confirmation issue

Payment status was not updating correctly after webhook call.
Added proper error handling and status verification.

Fixes #456

---

docs(api): update API documentation for payment endpoints

Added examples and error codes for all payment-related APIs.
```

### Commit Message Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when applicable

---

## Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow coding standards
   - Add tests if applicable

4. **Test your changes**
   ```bash
   npm run lint
   npm run build
   # Test manually in browser
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting PR

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Link related issues
5. Request review from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

- Maintainers will review your PR
- Address requested changes
- Keep PR focused and small
- Be responsive to feedback
- Once approved, PR will be merged

---

## Testing Guidelines

### Manual Testing

Before submitting, test these areas:

**Authentication**:
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Protected routes redirect correctly

**Meetings**:
- [ ] Create instant meeting
- [ ] Schedule meeting
- [ ] Join meeting via link
- [ ] Video/audio works
- [ ] Chat works
- [ ] Screen share works

**Features**:
- [ ] Super Chat payment flow
- [ ] Poll creation and voting
- [ ] Virtual backgrounds
- [ ] Recording (if admin)
- [ ] Broadcasting (if configured)

### Browser Testing

Test on multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing

Test on different devices:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Documentation

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change existing functionality
- Fix a significant bug
- Update dependencies
- Modify environment variables
- Change API endpoints

### Documentation Files

- `README.md` - Main project overview
- `FEATURES.md` - Complete feature list
- `SETUP.md` - Setup and installation guide
- `DEPLOYMENT.md` - Deployment instructions
- `API.md` - API documentation
- `CONTRIBUTING.md` - This file

### Code Comments

Add comments for:
- Complex algorithms
- Non-obvious business logic
- Workarounds or hacks
- Configuration requirements

**Example**:
```typescript
// Calculate duration based on Super Chat tier
// Each tier has a specific duration in seconds that the message stays pinned
const getDuration = (amount: number): number => {
  const tiers = {
    25: 30,      // Nitya Seva - 30 seconds
    50: 70,      // Bhakti Boost - 1m 10s
    100: 150,    // Gopi Glimmer - 2m 30s
    250: 360,    // Vaikuntha Vibes - 6m
    500: 720,    // Raja Bhakta Blessing - 12m
    1000: 1500,  // Parama Bhakta Offering - 25m
    5000: 4200   // Goloka Mahadhaan - 1h 10m
  };
  return tiers[amount as keyof typeof tiers] || 30;
};
```

---

## Additional Resources

### Learning Resources

**Next.js**:
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)

**TypeScript**:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

**React**:
- [React Documentation](https://react.dev)
- [React Patterns](https://reactpatterns.com/)

**Tailwind CSS**:
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/)

### Project-Specific Resources

- [Stream.io Video Docs](https://getstream.io/video/docs/)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cashfree Documentation](https://docs.cashfree.com/)

---

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search existing issues
3. Ask in a new issue
4. Email: divineconnectionkcs@gmail.com

---

## Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributors list

Thank you for your contribution! 🙏

---

**Together, let's build something that connects souls across the world!** 🕉️
