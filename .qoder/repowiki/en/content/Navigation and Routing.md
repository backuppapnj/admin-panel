# Navigation and Routing

<cite>
**Referenced Files in This Document**
- [layout.tsx](file://app/layout.tsx)
- [app-sidebar.tsx](file://components/app-sidebar.tsx)
- [sidebar.tsx](file://components/ui/sidebar.tsx)
- [use-mobile.tsx](file://hooks/use-mobile.tsx)
- [page.tsx](file://app/page.tsx)
- [agenda/[id]/edit/page.tsx](file://app/agenda/[id]/edit/page.tsx)
- [anggaran/[id]/edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx)
- [panggilan/[id]/edit/page.tsx](file://app/panggilan/[id]/edit/page.tsx)
- [sisa-panjar/[id]/page.tsx](file://app/sisa-panjar/[id]/page.tsx)
- [api.ts](file://lib/api.ts)
- [utils.ts](file://lib/utils.ts)
- [use-toast.ts](file://hooks/use-toast.ts)
- [globals.css](file://app/globals.css)
- [package.json](file://package.json)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the navigation and routing architecture of the Next.js admin panel. It covers the file-based routing model, dynamic routing with parameters, the sidebar navigation system, active state management, responsive behavior, route configuration patterns, navigation state management, and mobile responsiveness. It also provides examples of route creation, parameter handling, and navigation patterns, along with guidance on breadcrumbs, accessibility, and troubleshooting.

## Project Structure
The application follows Next.js App Router conventions with file-based routing under the app directory. Each feature module is organized as a folder with optional nested dynamic segments (for example, /[id]/edit). The root layout composes the sidebar and page content area. UI primitives for the sidebar are encapsulated in a reusable component.

```mermaid
graph TB
A["Root Layout<br/>app/layout.tsx"] --> B["Sidebar Provider<br/>components/ui/sidebar.tsx"]
B --> C["App Sidebar<br/>components/app-sidebar.tsx"]
A --> D["Main Content Area<br/>app/page.tsx"]
D --> E["Feature Pages<br/>app/agenda/[id]/edit/page.tsx"]
D --> F["Feature Pages<br/>app/anggaran/[id]/edit/page.tsx"]
D --> G["Feature Pages<br/>app/panggilan/[id]/edit/page.tsx"]
D --> H["Feature Pages<br/>app/sisa-panjar/[id]/page.tsx"]
```

**Diagram sources**
- [layout.tsx:12-36](file://app/layout.tsx#L12-L36)
- [sidebar.tsx:56-162](file://components/ui/sidebar.tsx#L56-L162)
- [app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)
- [page.tsx:10-237](file://app/page.tsx#L10-L237)
- [agenda/[id]/edit/page.tsx](file://app/agenda/[id]/edit/page.tsx#L17-L153)
- [anggaran/[id]/edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx#L29-L154)
- [panggilan/[id]/edit/page.tsx](file://app/panggilan/[id]/edit/page.tsx#L19-L339)
- [sisa-panjar/[id]/page.tsx](file://app/sisa-panjar/[id]/page.tsx#L28-L303)

**Section sources**
- [layout.tsx:12-36](file://app/layout.tsx#L12-L36)
- [sidebar.tsx:56-162](file://components/ui/sidebar.tsx#L56-L162)
- [app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)
- [page.tsx:10-237](file://app/page.tsx#L10-L237)

## Core Components
- Root layout: Provides the global shell, sidebar provider, and main content container.
- Sidebar provider and primitives: Manage responsive sidebar behavior, keyboard shortcuts, cookies, and state.
- App sidebar: Renders the navigation menu, computes active state from the current path, and integrates with the sidebar primitives.
- Feature pages: Demonstrate dynamic routing with parameters, parameter extraction, and navigation back to lists.

Key responsibilities:
- File-based routing: Next.js resolves routes from the app directory structure.
- Dynamic routing: Segments like [id] capture identifiers for edit pages.
- Active state: The sidebar highlights the current route using the pathname hook.
- Responsive behavior: Mobile detection toggles between overlay and collapsed modes.

**Section sources**
- [layout.tsx:12-36](file://app/layout.tsx#L12-L36)
- [sidebar.tsx:56-162](file://components/ui/sidebar.tsx#L56-L162)
- [app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)

## Architecture Overview
The navigation stack combines Next.js file-based routing with a custom sidebar component built on Radix UI primitives. The sidebar provider manages state and exposes a toggle mechanism. The app sidebar reads the current path and marks active menu items. Feature pages use dynamic segments to load and edit records by ID.

```mermaid
graph TB
subgraph "Runtime"
R["Next.js App Router"]
H["usePathname()<br/>next/navigation"]
U["useIsMobile()<br/>hooks/use-mobile.tsx"]
end
subgraph "UI Layer"
SP["SidebarProvider<br/>components/ui/sidebar.tsx"]
SB["Sidebar<br/>components/ui/sidebar.tsx"]
AS["AppSidebar<br/>components/app-sidebar.tsx"]
TR["SidebarTrigger<br/>components/ui/sidebar.tsx"]
end
subgraph "Pages"
D["Dashboard<br/>app/page.tsx"]
E1["Agenda Edit<br/>app/agenda/[id]/edit/page.tsx"]
E2["Anggaran Edit<br/>app/anggaran/[id]/edit/page.tsx"]
E3["Panggilan Edit<br/>app/panggilan/[id]/edit/page.tsx"]
E4["Sisa Panjar Detail<br/>app/sisa-panjar/[id]/page.tsx"]
end
R --> SP
SP --> SB
SP --> AS
H --> AS
U --> SP
TR --> SP
D --> AS
E1 --> AS
E2 --> AS
E3 --> AS
E4 --> AS
```

**Diagram sources**
- [layout.tsx:12-36](file://app/layout.tsx#L12-L36)
- [sidebar.tsx:56-162](file://components/ui/sidebar.tsx#L56-L162)
- [app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)
- [use-mobile.tsx:5-18](file://hooks/use-mobile.tsx#L5-L18)
- [page.tsx:10-237](file://app/page.tsx#L10-L237)
- [agenda/[id]/edit/page.tsx](file://app/agenda/[id]/edit/page.tsx#L17-L153)
- [anggaran/[id]/edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx#L29-L154)
- [panggilan/[id]/edit/page.tsx](file://app/panggilan/[id]/edit/page.tsx#L19-L339)
- [sisa-panjar/[id]/page.tsx](file://app/sisa-panjar/[id]/page.tsx#L28-L303)

## Detailed Component Analysis

### Sidebar Provider and Primitives
The sidebar provider encapsulates responsive behavior, keyboard shortcuts, cookie persistence, and state transitions. It exposes a context with state and toggle functions. The sidebar component renders either an overlay on mobile or a fixed panel on desktop, depending on device detection.

```mermaid
classDiagram
class SidebarProvider {
+boolean defaultOpen
+boolean open
+onOpenChange(open) void
+openMobile boolean
+setOpenMobile(open) void
+toggleSidebar() void
+state "expanded|collapsed"
}
class Sidebar {
+side "left|right"
+variant "sidebar|floating|inset"
+collapsible "offcanvas|icon|none"
+render() ReactNode
}
class SidebarTrigger {
+onClick(event) void
+render() Button
}
SidebarProvider --> Sidebar : "provides context"
SidebarProvider --> SidebarTrigger : "exposes toggle"
```

**Diagram sources**
- [sidebar.tsx:56-162](file://components/ui/sidebar.tsx#L56-L162)
- [sidebar.tsx:165-271](file://components/ui/sidebar.tsx#L165-L271)
- [sidebar.tsx:272-296](file://components/ui/sidebar.tsx#L272-L296)

**Section sources**
- [sidebar.tsx:56-162](file://components/ui/sidebar.tsx#L56-L162)
- [sidebar.tsx:165-271](file://components/ui/sidebar.tsx#L165-L271)
- [sidebar.tsx:272-296](file://components/ui/sidebar.tsx#L272-L296)

### App Sidebar Navigation
The app sidebar defines a static route list and computes the active item based on the current pathname. It renders icons, labels, and applies visual indicators for active states. The sidebar footer includes a user dropdown.

```mermaid
flowchart TD
Start(["Render AppSidebar"]) --> GetPath["Get current pathname"]
GetPath --> Iterate["Iterate route list"]
Iterate --> Compare{"pathname equals route.href?"}
Compare --> |Yes| MarkActive["Set isActive=true"]
Compare --> |No| MarkInactive["Set isActive=false"]
MarkActive --> Render["Render menu item with active styling"]
MarkInactive --> Render
Render --> End(["Done"])
```

**Diagram sources**
- [app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)

**Section sources**
- [app-sidebar.tsx:44-135](file://components/app-sidebar.tsx#L44-L135)
- [app-sidebar.tsx:137-231](file://components/app-sidebar.tsx#L137-L231)

### Dynamic Routing with Parameters
Dynamic routes are implemented via bracketed segments such as /[id]/edit. Feature pages extract the parameter, load data, and render forms or details. Navigation back to list views uses relative links.

```mermaid
sequenceDiagram
participant U as "User"
participant L as "Layout"
participant S as "Sidebar"
participant P as "Page (dynamic)"
participant A as "API"
U->>S : Click menu item
S-->>L : Navigate to route
L-->>P : Render page with params
P->>P : Extract params (e.g., id)
P->>A : Fetch resource by id
A-->>P : Resource data
P-->>U : Render form/detail
U->>P : Submit changes
P->>A : Update resource
A-->>P : Result
P-->>U : Show toast and redirect
```

**Diagram sources**
- [agenda/[id]/edit/page.tsx](file://app/agenda/[id]/edit/page.tsx#L17-L153)
- [anggaran/[id]/edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx#L29-L154)
- [panggilan/[id]/edit/page.tsx](file://app/panggilan/[id]/edit/page.tsx#L19-L339)
- [sisa-panjar/[id]/page.tsx](file://app/sisa-panjar/[id]/page.tsx#L28-L303)
- [api.ts:108-149](file://lib/api.ts#L108-L149)

**Section sources**
- [agenda/[id]/edit/page.tsx](file://app/agenda/[id]/edit/page.tsx#L17-L153)
- [anggaran/[id]/edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx#L29-L154)
- [panggilan/[id]/edit/page.tsx](file://app/panggilan/[id]/edit/page.tsx#L19-L339)
- [sisa-panjar/[id]/page.tsx](file://app/sisa-panjar/[id]/page.tsx#L28-L303)
- [api.ts:108-149](file://lib/api.ts#L108-L149)

### Parameter Handling Patterns
- Extract parameter: Use the router’s parameter hook to read the dynamic segment.
- Type conversion: Convert string IDs to numbers when needed.
- Guard clauses: Redirect to list view if the resource does not exist.
- Form updates: Build FormData for multipart submissions and append method overrides when required by the backend.

Examples:
- Agenda edit page extracts the ID, loads data, and redirects on missing records.
- Anggaran edit page builds FormData and posts with method override.
- Panggilan edit page handles file uploads via FormData and updates fields.
- Sisa panjar detail page loads and updates status-dependent fields.

**Section sources**
- [agenda/[id]/edit/page.tsx](file://app/agenda/[id]/edit/page.tsx#L18-L52)
- [anggaran/[id]/edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx#L30-L50)
- [panggilan/[id]/edit/page.tsx](file://app/panggilan/[id]/edit/page.tsx#L20-L70)
- [sisa-panjar/[id]/page.tsx](file://app/sisa-panjar/[id]/page.tsx#L29-L76)

### Navigation State Management and Responsive Behavior
- Path-based active state: The sidebar compares the current pathname against route hrefs.
- Cookie persistence: The sidebar provider writes a cookie to remember expanded/collapsed state.
- Keyboard shortcut: Toggle sidebar with a keyboard shortcut.
- Mobile detection: Uses a media query hook to switch between overlay and fixed sidebar.

**Section sources**
- [app-sidebar.tsx:137-163](file://components/app-sidebar.tsx#L137-L163)
- [sidebar.tsx:83-96](file://components/ui/sidebar.tsx#L83-L96)
- [sidebar.tsx:105-119](file://components/ui/sidebar.tsx#L105-L119)
- [use-mobile.tsx:5-18](file://hooks/use-mobile.tsx#L5-L18)

### Route Configuration Patterns
- Static routes: Defined in the sidebar route list.
- Dynamic routes: /[id]/edit for editing resources.
- Nested routes: Feature folders with optional subfolders for add/edit actions.
- Links: Relative links navigate between list and detail/add/edit pages.

**Section sources**
- [app-sidebar.tsx:44-135](file://components/app-sidebar.tsx#L44-L135)
- [page.tsx:64-196](file://app/page.tsx#L64-L196)

### Accessibility and UX Enhancements
- Tooltip support: Menu buttons can display tooltips when the sidebar is collapsed.
- Focus and keyboard: Trigger buttons expose accessible labels and keyboard interactions.
- Visual feedback: Active states use borders and shine effects; loading states use skeletons.
- Notifications: Toasts provide user feedback for success/error states.

**Section sources**
- [sidebar.tsx:567-601](file://components/ui/sidebar.tsx#L567-L601)
- [use-toast.ts:145-192](file://hooks/use-toast.ts#L145-L192)

### Breadcrumb Implementation
The current implementation does not include explicit breadcrumbs. To integrate breadcrumbs:
- Derive path segments from the current route.
- Map segments to human-readable labels.
- Render a small trail above the main content area.
- Optionally, compute parent routes for nested dynamic segments.

[No sources needed since this section proposes a general enhancement]

## Dependency Analysis
The navigation stack depends on Next.js runtime hooks, UI primitives, and shared utilities. The sidebar provider relies on a mobile detection hook and exposes a context consumed by the sidebar and trigger components.

```mermaid
graph LR
PM["package.json deps"] --> RN["next/navigation"]
PM --> RUI["@radix-ui/*"]
PM --> LC["lucide-react"]
PM --> TW["tailwind-*"]
RN --> AS["AppSidebar"]
RUI --> SB["Sidebar primitives"]
LC --> AS
TW --> AS
AS --> SB
```

**Diagram sources**
- [package.json:11-32](file://package.json#L11-L32)
- [app-sidebar.tsx:1-42](file://components/app-sidebar.tsx#L1-L42)
- [sidebar.tsx:1-26](file://components/ui/sidebar.tsx#L1-L26)

**Section sources**
- [package.json:11-32](file://package.json#L11-L32)
- [sidebar.tsx:1-26](file://components/ui/sidebar.tsx#L1-L26)
- [app-sidebar.tsx:1-42](file://components/app-sidebar.tsx#L1-L42)

## Performance Considerations
- Prefer server-rendered pages for initial loads; leverage client-side navigation for subsequent interactions.
- Minimize heavy computations in the sidebar; keep route lists static and memoized.
- Use skeletons during data fetches to maintain perceived performance.
- Avoid unnecessary re-renders by passing stable callbacks and avoiding inline object/function definitions in render paths.
- Cache API responses where appropriate and avoid redundant requests.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Active state not updating: Ensure the sidebar uses the pathname hook and that route hrefs match the current path exactly.
- Dynamic route not resolving: Verify the file path matches the route segment structure (for example, /[id]/edit/page.tsx).
- Parameter parsing errors: Convert string parameters to numbers and guard against invalid IDs.
- Navigation loops: Redirect to list pages when resources are not found.
- File uploads failing: Ensure FormData is constructed and method overrides are appended when required by the backend.
- Sidebar not toggling: Confirm the trigger is inside the sidebar provider and that the keyboard shortcut is not intercepted elsewhere.

**Section sources**
- [app-sidebar.tsx:137-163](file://components/app-sidebar.tsx#L137-L163)
- [agenda/[id]/edit/page.tsx](file://app/agenda/[id]/edit/page.tsx#L30-L52)
- [anggaran/[id]/edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx#L40-L50)
- [panggilan/[id]/edit/page.tsx](file://app/panggilan/[id]/edit/page.tsx#L44-L70)
- [sisa-panjar/[id]/page.tsx](file://app/sisa-panjar/[id]/page.tsx#L46-L76)
- [sidebar.tsx:98-119](file://components/ui/sidebar.tsx#L98-L119)

## Conclusion
The navigation and routing system leverages Next.js file-based routing with a robust sidebar component that manages responsive behavior, active states, and user interactions. Dynamic routes enable safe parameter handling and seamless navigation between list and detail views. The architecture balances simplicity with extensibility, supporting future enhancements such as breadcrumbs and improved accessibility.

## Appendices

### Example Route Creation Checklist
- Create a page under app/<feature>/page.tsx for list views.
- Add /[id]/edit/page.tsx for editing.
- Add /[id]/page.tsx for viewing details.
- Update the sidebar route list with the new feature.
- Implement parameter extraction and guards.
- Add navigation links from list to detail/add/edit.

[No sources needed since this section provides general guidance]