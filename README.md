# UTM Vault

UTM Vault is a comprehensive **UTM Tracking Tool** designed to assist users in generating, managing, and analyzing UTM-tracked links for marketing campaigns. The tool ensures parameter consistency, centralizes link management, facilitates tracking analysis, and supports team collaboration with role-based access. Also, the app guarantees organization-level data isolation.

## Overview

UTM Vault leverages a modern tech stack to deliver its functionality:

- **Frontend**: Built with React using Vite development server, integrated with shadcn-ui component library and styled with Tailwind CSS.
- **Backend**: Powered by Express.js, implementing REST API endpoints, MongoDB for data storage, and Mongoose for data modeling.
- **Authentication**: Token-based authentication with bearer access and refresh tokens.
- **Integration**: Google Analytics integration for real-time tracking and analysis.

### Project Structure

The project is organized into two main parts:

1. **Frontend** (`client/` folder):
   - **ReactJS** architecture with client-side routing using `react-router-dom`.
   - Components structured in `client/src/components` and pages in `client/src/pages`.
   - API requests handled in `client/src/api`.
   - Styled using Tailwind CSS and shadcn-ui.

2. **Backend** (`server/` folder):
   - **Express** REST API server.
   - MongoDB database support via Mongoose.
   - Authentication and user management logic in `server/routes` and `server/services`.

## Features

1. **UTM Link Generator**:
   - Generates UTM-tracked links with input fields for destination URL, medium, source, campaign name, and optional parameters (content, term).
   - Validates URL format and ensures parameter consistency.
   - Provides a 'Copy' action for generated links.

2. **Predefined Dropdowns**:
   - Uniformity through predefined dropdown values for medium and source.
   - Admins can add new dropdown values.

3. **Link Management**:
   - Saves and manages UTM links in a searchable and filterable database.
   - Export UTM link data in CSV/Excel format.

4. **Role-Based Access**:
   - Different user roles (Admin, Editor, Viewer) with varying access levels.
   - Secure authentication and role assignment.

5. **Organization-Level Isolation**:
   - Unique data isolation for each organization.
   - Administration options for organization management.

6. **User Guidelines**:
   - Embedded best practices for UTM tracking.

7. **Dashboard Stats**:
   - Analytics on dashboard for marketing campaign performance.

8. **Integration with Google Analytics**:
   - Real-time analytics with OAuth 2.0 for secure connections.

## Getting started

### Requirements

- Node.js (version 14 or higher)
- npm
- MongoDB

### Quickstart

Follow these steps to set up and run the project:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/username/utm-vault.git
   cd utm-vault
   ```

2. **Create environment files**:

   - Backend `.env` file:
     ```sh
     cd server
     cp .env.example .env
     # Populate the .env file with necessary environment variables
     ```

3. **Install dependencies**:

   - Backend:
     ```sh
     cd server
     npm install
     ```

   - Frontend:
     ```sh
     cd client
     npm install
     ```

4. **Run the project**:
   ```sh
   # Navigate to project root
   cd ..
   npm run start
   ```

The application should now be running with the frontend available on `http://localhost:5173` and the backend on `http://localhost:3000`. 

## License

The project is proprietary (not open source).

```
Copyright (c) 2024.
```