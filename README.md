# Mind the Gap

A beautiful, production-ready task management application with project organization and calendar integration.

## Features

- **Project-based Organization**: Organize tasks into projects with hierarchical sub-projects
- **Smart Status Tracking**: Automatic project status detection (Active, Review, Finished)
- **Calendar Integration**: Google Calendar-style time slots for task scheduling
- **Real-time Updates**: Live synchronization with Supabase backend
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Secure Authentication**: User authentication powered by Supabase

## Project Status System

- **Active**: Projects with upcoming tasks and clear next steps
- **Review**: Projects that need attention (overdue tasks, no next steps, or subprojects needing review)
- **Finished**: Manually marked completed projects

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your Supabase project and add environment variables
4. Run the development server: `npm run dev`

## Database Schema

The application uses two main tables:
- `projects`: Store project information with hierarchical relationships
- `tasks`: Store individual tasks linked to projects

Row Level Security (RLS) is enabled to ensure users can only access their own data.

## Deployment

This application is optimized for deployment on Netlify with automatic builds from the main branch.