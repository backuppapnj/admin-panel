# Getting Started

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [next.config.js](file://next.config.js)
- [tsconfig.json](file://tsconfig.json)
- [tailwind.config.ts](file://tailwind.config.ts)
- [postcss.config.js](file://postcss.config.js)
- [components.json](file://components.json)
- [next-env.d.ts](file://next-env.d.ts)
- [app/layout.tsx](file://app/layout.tsx)
- [app/page.tsx](file://app/page.tsx)
- [components/app-sidebar.tsx](file://components/app-sidebar.tsx)
- [lib/api.ts](file://lib/api.ts)
- [lib/utils.ts](file://lib/utils.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation and Setup](#installation-and-setup)
4. [Development Environment Configuration](#development-environment-configuration)
5. [First Run and Basic Navigation](#first-run-and-basic-navigation)
6. [Step-by-Step Setup Examples](#step-by-step-setup-examples)
7. [Common Troubleshooting Tips](#common-troubleshooting-tips)
8. [Conclusion](#conclusion)

## Introduction
This guide helps you set up and run the admin panel development environment. It covers prerequisites, installation, configuration, first run, navigation, and troubleshooting. The project is a Next.js application using TypeScript, Tailwind CSS, and Radix UI components.

## Prerequisites
- Node.js: The project specifies a Next.js version compatible with modern Node.js LTS releases. Install a recent LTS version of Node.js to ensure compatibility with the included dependencies.
- React and Next.js: Basic understanding of React (including hooks and client-side rendering) and Next.js routing is assumed.
- TypeScript: Familiarity with TypeScript basics (interfaces, types, and strict mode) is helpful.
- Package manager: npm is used by the scripts in this project.

Key indicators in the repository:
- Next.js version constraint is defined in dependencies.
- TypeScript compiler options and strict mode are enabled.
- Tailwind CSS and PostCSS are configured for styling.

**Section sources**
- [package.json:11-32](file://package.json#L11-L32)
- [tsconfig.json:12-19](file://tsconfig.json#L12-L19)
- [tailwind.config.ts:1-106](file://tailwind.config.ts#L1-L106)
- [postcss.config.js:1-7](file://postcss.config.js#L1-L7)

## Installation and Setup
Follow these steps to install dependencies and prepare the environment:

1. Install dependencies
   - Use npm to install all dependencies defined in the project.
   - This installs Next.js, React, Tailwind CSS, Radix UI components, and TypeScript tooling.

2. Verify TypeScript configuration
   - The TypeScript compiler is configured with strict mode, JSX transform, and path aliases.

3. Configure Tailwind CSS
   - Tailwind is set up with a content configuration scanning app, components, pages, and src directories.
   - PostCSS is configured to use Tailwind and Autoprefixer.

4. Initialize UI components (optional)
   - The project includes a components registry configuration for shadcn/ui components.

What to expect after installation:
- The development server can be started via the provided script.
- The application layout and sidebar are ready to render.

**Section sources**
- [package.json:5-10](file://package.json#L5-L10)
- [tsconfig.json:1-43](file://tsconfig.json#L1-L43)
- [tailwind.config.ts:5-12](file://tailwind.config.ts#L5-L12)
- [postcss.config.js:1-7](file://postcss.config.js#L1-L7)
- [components.json:1-25](file://components.json#L1-L25)

## Development Environment Configuration
The development environment is configured through several key files:

- Next.js configuration
  - Strict mode is enabled for improved error detection during development.
  - No additional custom configuration is present in the provided file.

- TypeScript configuration
  - Strict mode is enabled.
  - Path aliases are configured to simplify imports using @/.

- Tailwind CSS configuration
  - Content paths include app, components, pages, and src directories.
  - Theme extensions include colors, radii, and animations.
  - The animate plugin is enabled.

- Environment typing
  - Next.js type declarations are referenced for type-safe development.

- UI component registry
  - Shadcn/ui configuration defines style, TSX usage, Tailwind settings, and aliases.

How this affects development:
- Strict TypeScript checks help catch errors early.
- Tailwind scanning ensures unused styles are purged in production.
- Aliases reduce long relative imports.

**Section sources**
- [next.config.js:2-4](file://next.config.js#L2-L4)
- [tsconfig.json:12-30](file://tsconfig.json#L12-L30)
- [tailwind.config.ts:5-102](file://tailwind.config.ts#L5-L102)
- [next-env.d.ts:1-7](file://next-env.d.ts#L1-L7)
- [components.json:6-20](file://components.json#L6-L20)

## First Run and Basic Navigation
After installing dependencies, start the development server:

- Start the development server
  - Run the dev script to launch Next.js in development mode.

- Access the application
  - Open the local URL shown by the development server.
  - The root page displays a dashboard with quick links to various administrative areas.

- Explore the layout and navigation
  - The layout wraps children in a provider that enables the sidebar.
  - The main content area includes a sticky header with a sidebar trigger and a content area.
  - The sidebar lists available administrative sections and highlights the active route.

- Navigate to features
  - Use the sidebar menu to navigate between sections such as Panggilan Ghaib, Itsbat Nikah, Agenda Pimpinan, and others.

- Backend integration note
  - API endpoints are configured via environment variables. Ensure the backend service is running and reachable if you plan to test data operations.

**Section sources**
- [package.json:6](file://package.json#L6)
- [app/layout.tsx:12-36](file://app/layout.tsx#L12-L36)
- [app/page.tsx:10-237](file://app/page.tsx#L10-L237)
- [components/app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)
- [lib/api.ts:2-4](file://lib/api.ts#L2-L4)

## Step-by-Step Setup Examples
Below are practical steps to get the project running locally:

Step 1: Install dependencies
- From the project root, run the package manager install command to fetch all dependencies.

Step 2: Start the development server
- Run the development script to start Next.js in development mode.

Step 3: Verify the dashboard
- Visit the local URL to confirm the dashboard renders and the sidebar is interactive.

Step 4: Confirm TypeScript and Tailwind
- Create or edit a component to ensure TypeScript strict mode and Tailwind classes work as expected.

Step 5: Optional UI component setup
- If you plan to use shadcn/ui components, follow the registry configuration defined in the components configuration file.

Step 6: Backend connectivity (if testing data operations)
- Set the appropriate environment variables for the API base URL and key if you intend to interact with the backend.

**Section sources**
- [package.json:5-10](file://package.json#L5-L10)
- [app/page.tsx:10-237](file://app/page.tsx#L10-L237)
- [components.json:1-25](file://components.json#L1-L25)
- [lib/api.ts:2-4](file://lib/api.ts#L2-L4)

## Common Troubleshooting Tips
Issues and resolutions commonly encountered during initial setup:

- Node.js version mismatch
  - Symptom: Errors during install or runtime related to engine requirements.
  - Resolution: Install a supported LTS version of Node.js and retry installation and startup.

- TypeScript strict mode errors
  - Symptom: Build failures due to strict type checking.
  - Resolution: Address missing types or add explicit types as suggested by the compiler. Review the strict mode configuration.

- Tailwind CSS not applying styles
  - Symptom: Styles not appearing or purged unexpectedly.
  - Resolution: Ensure content paths in the Tailwind configuration match your project structure. Rebuild the project after changes.

- PostCSS processing errors
  - Symptom: Build errors related to Tailwind or Autoprefixer.
  - Resolution: Verify PostCSS configuration includes Tailwind and Autoprefixer plugins.

- Missing environment variables for API
  - Symptom: API requests fail or return unexpected results.
  - Resolution: Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_KEY to valid values if you plan to test backend integration.

- Sidebar or layout not rendering
  - Symptom: Missing sidebar or layout issues.
  - Resolution: Confirm the layout wrapper and providers are applied to pages. Check the sidebar component and route highlighting logic.

- Package manager conflicts
  - Symptom: Conflicting dependency versions or lockfile errors.
  - Resolution: Clear node_modules and reinstall dependencies. Prefer using the package manager specified by the project scripts.

**Section sources**
- [tsconfig.json:12-19](file://tsconfig.json#L12-L19)
- [tailwind.config.ts:5-12](file://tailwind.config.ts#L5-L12)
- [postcss.config.js:1-7](file://postcss.config.js#L1-L7)
- [lib/api.ts:2-4](file://lib/api.ts#L2-L4)
- [components/app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)

## Conclusion
You now have the essentials to install, configure, and run the admin panel locally. Use the development server to explore the dashboard and sidebar, and refer to the troubleshooting tips if you encounter issues. When ready, connect to the backend by setting the required environment variables to test full functionality.