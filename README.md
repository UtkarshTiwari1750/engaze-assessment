# Resume Builder

A full-featured resume builder application with on-canvas editing, template switching, design customization, drag-and-drop reordering, undo-redo functionality, PDF export, and public sharing capabilities.

## Features

### Core Functionality

- **On-Canvas Editing**: Edit resume content directly on the preview canvas
- **Template System**: Multiple professional templates with customizable themes
- **Design Customization**: Custom colors, fonts, spacing, and layout options
- **Drag & Drop**: Reorder sections and items with intuitive drag-and-drop
- **Undo/Redo**: Full history tracking with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
- **Auto-Save**: Automatic saving with debounced updates
- **PDF Export**: High-quality PDF generation with text-based output
- **Public Sharing**: Share resumes with customizable privacy settings

### Advanced Features

- **Real-time Collaboration**: Live updates and conflict resolution
- **Version History**: Save and restore previous versions
- **Template Gallery**: Browse and preview available templates
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Offline Support**: Local caching for offline editing
- **Password Protection**: Secure sharing with optional passwords
- **Analytics**: Track resume views and engagement

## Tech Stack

### Frontend

- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **TanStack Query** for server state synchronization
- **React Router DOM** for routing
- **Tailwind CSS v4** for styling
- **shadcn/ui** for UI components
- **@dnd-kit** for drag-and-drop functionality
- **Vite** for build tooling

### Backend

- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **bcrypt** for password hashing
- **@react-pdf/renderer** for PDF generation
- **Zod** for validation

### Database

- **PostgreSQL** with normalized schema
- **Prisma** for database management
- **JSONB** fields for flexible content storage

## Architecture

### Database Schema

- **Users**: Authentication and profile data
- **Resumes**: Resume metadata and relationships
- **Sections**: Resume sections with ordering
- **Section Items**: Individual content items
- **Templates & Themes**: Design system
- **Sharing Links**: Public sharing configuration
- **Version History**: Undo/redo snapshots

### State Management

- **Auth Slice**: User authentication state
- **Resume Slice**: Current resume data with optimistic updates
- **Template Slice**: Design configuration and templates
- **History Slice**: Undo/redo functionality
- **Custom Middleware**: Automatic history tracking

### API Design

- **RESTful endpoints** with consistent response format
- **JWT authentication** for protected routes
- **Input validation** with Zod schemas
- **Error handling** with custom error classes
- **File uploads** for template previews

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd resume-builder
   ```

2. **Install dependencies**

   ```bash
   # Backend
   cd server
   npm install  # or bun install

   # Frontend
   cd ../client
   npm install  # or bun install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Update with your configuration
   # DATABASE_URL, JWT_SECRET, etc.
   ```

4. **Database Setup**

   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start Development Servers**

   ```bash
   # Backend (Terminal 1)
   cd server
   npm run dev

   # Frontend (Terminal 2)
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3004

## Project Structure

```
resume-builder/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── provider/       # Redux store and slices
│   │   ├── types/          # TypeScript type definitions
│   │   ├── config/         # Configuration files
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, resume, etc.)
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
└── README.md
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Resume Endpoints

- `GET /api/resumes` - List user resumes
- `POST /api/resumes` - Create new resume
- `GET /api/resumes/:id` - Get resume details
- `PATCH /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Section Endpoints

- `POST /api/resumes/:id/sections` - Add section
- `PATCH /api/resumes/:id/sections/:sectionId` - Update section
- `DELETE /api/resumes/:id/sections/:sectionId` - Delete section
- `PUT /api/resumes/:id/sections/reorder` - Reorder sections

### Template Endpoints

- `GET /api/templates` - List templates
- `POST /api/resumes/:id/template` - Apply template
- `GET /api/resumes/:id/design` - Get design config
- `PATCH /api/resumes/:id/design` - Update design

### Sharing Endpoints

- `POST /api/resumes/:id/share` - Create sharing link
- `GET /api/share/:slug` - View public resume
- `GET /api/resumes/:id/pdf` - Download PDF

## Development

### Available Scripts

**Backend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database
- `npm run prisma:studio` - Open Prisma Studio

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## Deployment

### Production Build

```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `CORS_ORIGIN` - Frontend URL for CORS
- `NODE_ENV` - Environment (development/production)

### Docker Support

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow TypeScript best practices
- Use semantic commit messages
- Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@resumebuilder.com or join our Discord community.

## Roadmap

- [ ] AI-powered content suggestions
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Integration with job boards
- [ ] Mobile app development
- [ ] Advanced PDF customization
- [ ] Multi-language support
