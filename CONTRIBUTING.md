# 🤝 Contributing to HealConnect

Thank you for your interest in contributing to HealConnect! We welcome contributions from developers of all skill levels. This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand the standards we expect from our community.

## 🚀 Getting Started

### Ways to Contribute

- **Bug Reports**: Help us identify and fix bugs
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit bug fixes or new features
- **Documentation**: Improve or translate documentation
- **Testing**: Help test new features and bug fixes
- **Design**: Contribute UI/UX improvements

### Before You Start

1. **Check Existing Issues**: Look through existing issues to avoid duplicates
2. **Discuss Major Changes**: For significant changes, open an issue first to discuss
3. **Read Documentation**: Familiarize yourself with the project structure and goals

## 💻 Development Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v6 or higher)
- **Git**
- **Code Editor** (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/HealConnect.git
   cd HealConnect
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Aryan1438/HealConnect.git
   ```

### Environment Setup

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Servers**:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## 🔧 Making Changes

### Branching Strategy

1. **Create a new branch** from main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Branch naming convention**:
   - `feature/feature-name` - New features
   - `fix/bug-description` - Bug fixes
   - `docs/update-description` - Documentation updates
   - `refactor/component-name` - Code refactoring

### Development Workflow

1. **Make your changes** in small, logical commits
2. **Test your changes** thoroughly
3. **Update documentation** if needed
4. **Ensure code quality** with linting and formatting

### Commit Guidelines

Use clear, descriptive commit messages following this format:

```
type(scope): brief description

Longer description if needed

Closes #issue-number
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(appointments): add appointment cancellation feature

fix(auth): resolve JWT token expiration issue

docs(readme): update installation instructions

style(dashboard): improve responsive layout
```

## 📝 Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**:
   ```bash
   # Backend
   cd backend && npm test && npm run lint
   
   # Frontend
   cd frontend && npm test && npm run lint
   ```

3. **Update documentation** if your changes affect user-facing features

### Submitting a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - List of changes made
   - Testing instructions

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Related Issues
Closes #issue-number

## Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any additional information for reviewers
```

### Review Process

1. **Automated Checks**: Ensure all CI checks pass
2. **Code Review**: Wait for maintainer review
3. **Address Feedback**: Make requested changes
4. **Approval**: Once approved, your PR will be merged

## 🎨 Code Style Guidelines

### JavaScript/TypeScript

- Use **TypeScript** for type safety
- Follow **ESLint** configuration
- Use **Prettier** for formatting
- Prefer **const** over **let**
- Use **async/await** over promises chains

```typescript
// ✅ Good
const fetchPatient = async (id: string): Promise<Patient> => {
  try {
    const patient = await Patient.findById(id);
    return patient;
  } catch (error) {
    throw new Error(`Failed to fetch patient: ${error.message}`);
  }
};

// ❌ Bad
function getPatient(id) {
  return Patient.findById(id).then(patient => {
    return patient;
  }).catch(err => {
    console.log(err);
  });
}
```

### React Components

- Use **functional components** with hooks
- Follow **React best practices**
- Use **TypeScript interfaces** for props
- Keep components **small and focused**

```tsx
// ✅ Good
interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onEdit }) => {
  const handleEditClick = useCallback(() => {
    onEdit(patient);
  }, [patient, onEdit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleEditClick}>Edit</Button>
      </CardContent>
    </Card>
  );
};
```

### CSS/Styling

- Use **Tailwind CSS** classes
- Follow **responsive design** principles
- Use **semantic color names**
- Keep **custom CSS minimal**

```tsx
// ✅ Good
<div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
  <div className="p-8">
    <h2 className="text-2xl font-bold text-gray-900">Patient Information</h2>
    <p className="mt-2 text-gray-600">Patient details and medical history</p>
  </div>
</div>
```

## 🧪 Testing

### Writing Tests

- Write **unit tests** for utility functions
- Write **integration tests** for API endpoints
- Write **component tests** for React components
- Aim for **good test coverage**

### Backend Testing

```javascript
// Example API test
describe('Patient API', () => {
  it('should create a new patient', async () => {
    const patientData = {
      name: 'John Doe',
      age: 30,
      gender: 'Male',
      mobile: '1234567890'
    };

    const response = await request(app)
      .post('/api/patients')
      .send(patientData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.patient.name).toBe('John Doe');
  });
});
```

### Frontend Testing

```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import PatientCard from '../PatientCard';

describe('PatientCard', () => {
  const mockPatient = {
    id: '1',
    name: 'John Doe',
    age: 30,
    gender: 'Male'
  };

  it('should render patient information', () => {
    render(<PatientCard patient={mockPatient} onEdit={() => {}} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});
```

## 📖 Documentation

### Code Documentation

- Add **JSDoc comments** for functions
- Document **complex algorithms**
- Explain **business logic**
- Update **README** for new features

### API Documentation

- Document **all endpoints**
- Include **request/response examples**
- Specify **authentication requirements**
- Note **breaking changes**

## 🌟 Recognition

Contributors who make significant contributions will be:

- **Listed in Contributors** section
- **Mentioned in release notes**
- **Invited to join** the core team (for ongoing contributors)
- **Featured** in project announcements

## 💬 Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bugs and feature requests
- **Code Review**: Learn from feedback on your PRs

### Communication Guidelines

- **Be respectful** and inclusive
- **Provide context** in your questions
- **Help others** when you can
- **Follow up** on your contributions

## 🏆 First-Time Contributors

New to open source? Here are some good first issues:

- **Documentation improvements**
- **UI/UX enhancements**
- **Bug fixes** with clear reproduction steps
- **Test coverage** improvements

Look for issues labeled with `good first issue` or `help wanted`.

## 📚 Resources

### Learning Resources

- [React Documentation](https://reactjs.org/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB University](https://university.mongodb.com/)

### Tools

- **VS Code Extensions**: ESLint, Prettier, TypeScript
- **Browser DevTools**: Chrome/Firefox developer tools
- **Postman**: API testing
- **MongoDB Compass**: Database management

---

Thank you for contributing to HealConnect! Your efforts help make healthcare management more accessible and efficient for everyone. 

**Happy Coding! 🚀**