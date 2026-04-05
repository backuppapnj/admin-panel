# Anggaran (Budget Management)

<cite>
**Referenced Files in This Document**
- [page.tsx](file://app/anggaran/page.tsx)
- [tambah/page.tsx](file://app/anggaran/tambah/page.tsx)
- [edit/page.tsx](file://app/anggaran/[id]/edit/page.tsx)
- [pagu/page.tsx](file://app/anggaran/pagu/page.tsx)
- [api.ts](file://lib/api.ts)
- [utils.ts](file://lib/utils.ts)
- [layout.tsx](file://app/layout.tsx)
- [app-sidebar.tsx](file://components/app-sidebar.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Budget Management Workflows](#budget-management-workflows)
7. [Pagu Control System](#pagu-control-system)
8. [Data Validation and Entry Patterns](#data-validation-and-entry-patterns)
9. [Integration with Financial Systems](#integration-with-financial-systems)
10. [Reporting and Compliance](#reporting-and-compliance)
11. [Performance Considerations](#performance-considerations)
12. [Troubleshooting Guide](#troubleshooting-guide)
13. [Conclusion](#conclusion)

## Introduction

The Anggaran module is a comprehensive budget management and allocation system designed for judicial institutions to track and manage their annual budgets. This module provides complete lifecycle management for budget creation, approval, execution tracking, and reporting. The system supports two primary budget categories (DIPA 01 and DIPA 04) with dedicated pagu (budget limit) controls to prevent overspending and ensure compliance with financial regulations.

The module integrates seamlessly with the broader administrative panel ecosystem, providing real-time budget tracking, automated calculations, and comprehensive audit trails for all financial transactions.

## Project Structure

The Anggaran module follows a structured Next.js application architecture with clear separation of concerns:

```mermaid
graph TB
subgraph "Anggaran Module"
List[Anggaran List Page]
Add[Add Realisasi Page]
Edit[Edit Realisasi Page]
Pagu[Pagu Configuration Page]
end
subgraph "Shared Components"
API[API Library]
Utils[Utility Functions]
UI[UI Components]
end
subgraph "Navigation"
Sidebar[App Sidebar]
Layout[Root Layout]
end
List --> API
Add --> API
Edit --> API
Pagu --> API
API --> Utils
List --> UI
Add --> UI
Edit --> UI
Pagu --> UI
Sidebar --> List
Sidebar --> Add
Sidebar --> Edit
Sidebar --> Pagu
Layout --> Sidebar
Layout --> List
```

**Diagram sources**
- [page.tsx:1-335](file://app/anggaran/page.tsx#L1-L335)
- [tambah/page.tsx:1-204](file://app/anggaran/tambah/page.tsx#L1-L204)
- [edit/page.tsx:1-154](file://app/anggaran/[id]/edit/page.tsx#L1-L154)
- [pagu/page.tsx:1-131](file://app/anggaran/pagu/page.tsx#L1-L131)

**Section sources**
- [page.tsx:1-335](file://app/anggaran/page.tsx#L1-L335)
- [tambah/page.tsx:1-204](file://app/anggaran/tambah/page.tsx#L1-L204)
- [edit/page.tsx:1-154](file://app/anggaran/[id]/edit/page.tsx#L1-L154)
- [pagu/page.tsx:1-131](file://app/anggaran/pagu/page.tsx#L1-L131)

## Core Components

### Budget Data Models

The Anggaran module operates on two primary data models that define the budget management structure:

**RealisasiAnggaran Model**: Represents monthly budget realization records
- `id`: Unique identifier for each realization record
- `dipa`: Budget category (DIPA 01 or DIPA 04)
- `kategori`: Specific expense category within the budget
- `bulan`: Month of realization (1-12)
- `tahun`: Year of budget cycle
- `realisasi`: Actual amount spent
- `link_dokumen`: Document reference for transparency
- `keterangan`: Additional notes or descriptions

**PaguAnggaran Model**: Defines budget limits and allocations
- `id`: Unique identifier for pagu configuration
- `dipa`: Budget category reference
- `kategori`: Expense category reference
- `jumlah_pagu`: Maximum allowable budget amount
- `tahun`: Year of pagu configuration

### API Integration Layer

The module utilizes a centralized API library that provides standardized communication with the backend financial system:

```mermaid
sequenceDiagram
participant Client as "Anggaran UI"
participant API as "API Library"
participant Backend as "Financial Backend"
Client->>API : getAllAnggaran(filters)
API->>Backend : GET /anggaran?filters
Backend-->>API : ApiResponse<Anggaran[]>
API-->>Client : Normalized Response
Client->>API : createAnggaran(data)
API->>Backend : POST /anggaran
Backend-->>API : ApiResponse<Anggaran>
API-->>Client : Success/Failure
Client->>API : getAllPagu(filters)
API->>Backend : GET /pagu?filters
Backend-->>API : ApiResponse<Pagu[]>
API-->>Client : Pagu Configuration
```

**Diagram sources**
- [api.ts:429-471](file://lib/api.ts#L429-L471)
- [api.ts:499-523](file://lib/api.ts#L499-L523)

**Section sources**
- [api.ts:356-370](file://lib/api.ts#L356-L370)
- [api.ts:477-483](file://lib/api.ts#L477-L483)
- [api.ts:429-523](file://lib/api.ts#L429-L523)

## Architecture Overview

The Anggaran module implements a client-server architecture with clear separation between presentation, business logic, and data persistence layers:

```mermaid
graph TB
subgraph "Presentation Layer"
UI_List[Anggaran List UI]
UI_Add[Add Realisasi UI]
UI_Edit[Edit Realisasi UI]
UI_Pagu[Pagu Configuration UI]
end
subgraph "Business Logic Layer"
BL_Anggaran[Budget Management Logic]
BL_Pagu[Pagu Control Logic]
BL_Validation[Data Validation]
end
subgraph "Integration Layer"
IL_API[API Communication]
IL_File[File Upload Handler]
end
subgraph "Data Layer"
DL_Backend[Backend Database]
DL_Files[Document Storage]
end
UI_List --> BL_Anggaran
UI_Add --> BL_Anggaran
UI_Edit --> BL_Anggaran
UI_Pagu --> BL_Pagu
BL_Anggaran --> IL_API
BL_Pagu --> IL_API
BL_Validation --> IL_API
IL_API --> DL_Backend
IL_File --> DL_Files
BL_Anggaran --> UI_List
BL_Anggaran --> UI_Add
BL_Anggaran --> UI_Edit
BL_Pagu --> UI_Pagu
```

**Diagram sources**
- [page.tsx:31-335](file://app/anggaran/page.tsx#L31-L335)
- [tambah/page.tsx:39-204](file://app/anggaran/tambah/page.tsx#L39-L204)
- [edit/page.tsx:29-154](file://app/anggaran/[id]/edit/page.tsx#L29-L154)
- [pagu/page.tsx:19-131](file://app/anggaran/pagu/page.tsx#L19-L131)

## Detailed Component Analysis

### Anggaran List Component

The main dashboard component provides comprehensive budget tracking and management capabilities:

```mermaid
classDiagram
class AnggaranList {
+useState data : RealisasiAnggaran[]
+useState loading : boolean
+useState pagination : PaginationState
+loadData(page : number) void
+handleDelete(id : number) void
+formatCurrency(amount : number) string
+renderPaginationItems() JSX.Element[]
}
class RealisasiAnggaran {
+number id
+string dipa
+string kategori
+number bulan
+number tahun
+number realisasi
+number pagu
+number sisa
+number persentase
+string link_dokumen
+string keterangan
}
class PaginationState {
+number current_page
+number last_page
+number total
}
AnggaranList --> RealisasiAnggaran : manages
AnggaranList --> PaginationState : uses
```

**Diagram sources**
- [page.tsx:31-335](file://app/anggaran/page.tsx#L31-L335)
- [api.ts:356-370](file://lib/api.ts#L356-L370)

Key features include:
- **Multi-filtering**: Filter by DIPA category and year
- **Pagination**: Efficient handling of large datasets
- **Real-time calculations**: Automatic percentage and balance calculations
- **Document integration**: Direct linking to supporting documents
- **Bulk operations**: Delete functionality with confirmation dialogs

**Section sources**
- [page.tsx:31-335](file://app/anggaran/page.tsx#L31-L335)

### Realisasi Anggaran Form

The form component provides comprehensive data entry for budget realizations:

```mermaid
flowchart TD
Start([Form Initialization]) --> LoadPagu[Load Pagu Configuration]
LoadPagu --> ValidateDipa{Validate DIPA Selection}
ValidateDipa --> |Invalid| ShowError[Display Error Message]
ValidateDipa --> |Valid| LoadCategories[Load Category Options]
LoadCategories --> RenderForm[Render Form Fields]
RenderForm --> UserInput[User Data Entry]
UserInput --> ValidateInput{Validate Input Fields}
ValidateInput --> |Invalid| ShowValidation[Show Validation Errors]
ValidateInput --> |Valid| SubmitData[Submit to API]
SubmitData --> HandleResponse{Handle API Response}
HandleResponse --> |Success| ShowSuccess[Show Success Toast]
HandleResponse --> |Error| ShowError[Show Error Toast]
ShowSuccess --> Redirect[Redirect to List]
ShowError --> Wait[Wait for User Correction]
Wait --> UserInput
```

**Diagram sources**
- [tambah/page.tsx:71-106](file://app/anggaran/tambah/page.tsx#L71-L106)

**Section sources**
- [tambah/page.tsx:39-204](file://app/anggaran/tambah/page.tsx#L39-L204)

### Pagu Configuration System

The pagu configuration component enables administrators to set and modify budget limits:

```mermaid
sequenceDiagram
participant Admin as "Administrator"
participant PaguUI as "Pagu Configuration UI"
participant APIService as "API Service"
participant Database as "Backend Database"
Admin->>PaguUI : Open Pagu Configuration
PaguUI->>APIService : getAllPagu(tahun)
APIService->>Database : Query Pagu Records
Database-->>APIService : Pagu Data
APIService-->>PaguUI : Pagu Configuration
Admin->>PaguUI : Modify Pagu Amount
PaguUI->>PaguUI : Validate Input
PaguUI->>APIService : updatePagu(config)
APIService->>Database : Update Pagu Record
Database-->>APIService : Confirmation
APIService-->>PaguUI : Success Response
PaguUI-->>Admin : Show Success Message
```

**Diagram sources**
- [pagu/page.tsx:26-56](file://app/anggaran/pagu/page.tsx#L26-L56)
- [api.ts:508-515](file://lib/api.ts#L508-L515)

**Section sources**
- [pagu/page.tsx:19-131](file://app/anggaran/pagu/page.tsx#L19-L131)

## Budget Management Workflows

### Budget Creation Workflow

The budget creation process follows a structured workflow to ensure proper allocation and tracking:

```mermaid
flowchart TD
Start([Initiate Budget Creation]) --> SelectCategory[Select DIPA Category]
SelectCategory --> SelectYear[Select Budget Year]
SelectYear --> SelectMonth[Select Reporting Month]
SelectMonth --> SelectCategory[Select Expense Category]
SelectCategory --> EnterAmount[Enter Realization Amount]
EnterAmount --> UploadDocument[Upload Supporting Documents]
UploadDocument --> ValidateData{Validate All Fields}
ValidateData --> |Invalid| ShowErrors[Display Validation Errors]
ValidateData --> |Valid| CheckPagu[Check Pagu Limit]
CheckPagu --> ExceedsLimit{Exceeds Pagu?}
ExceedsLimit --> |Yes| BlockEntry[Block Entry with Warning]
ExceedsLimit --> |No| SubmitEntry[Submit to Database]
ShowErrors --> EnterAmount
BlockEntry --> ShowErrors
SubmitEntry --> Success[Show Success Message]
Success --> Redirect[List View]
```

**Diagram sources**
- [tambah/page.tsx:71-106](file://app/anggaran/tambah/page.tsx#L71-L106)
- [api.ts:447-454](file://lib/api.ts#L447-L454)

### Approval and Execution Tracking

The system maintains comprehensive audit trails for all budget modifications:

```mermaid
stateDiagram-v2
[*] --> Created
Created --> PendingApproval : Data Submitted
PendingApproval --> Approved : Supervisor Review
PendingApproval --> Rejected : Supervisor Review
Approved --> Executed : Payment Processed
Executed --> Completed : Final Settlement
Rejected --> Modified : Corrections Made
Modified --> PendingApproval : Resubmission
Completed --> [*]
```

**Section sources**
- [page.tsx:194-270](file://app/anggaran/page.tsx#L194-L270)

## Pagu Control System

### Pagu Enforcement Mechanisms

The pagu control system implements robust budget limit enforcement:

| Control Type | Implementation | Enforcement Level |
|--------------|----------------|-------------------|
| Monthly Limits | Real-time calculation against pagu | Hard Limit |
| Annual Caps | Aggregate monthly totals | Hard Limit |
| Category-Specific | Separate limits per expense category | Hard Limit |
| Cross-Category Monitoring | Inter-category spending analysis | Soft Alert |

### Pagu Calculation Algorithms

The system employs sophisticated algorithms for real-time budget tracking:

**Real-time Pagu Calculation:**
```
CurrentPagu = PaguConfiguration[dipa][kategori][tahun]
MonthlySpent = SUM(RealisasiAnggaran[dipa][kategori][bulan=tahun])
RemainingPagu = CurrentPagu - MonthlySpent
ExceededAmount = MAX(0, MonthlySpent - CurrentPagu)
```

**Multi-Year Planning Algorithm:**
```
YearlyAllocation = PaguConfiguration[dipa][kategori][tahun]
AnnualConsumption = SUM(MonthlySpent[dipa][kategori][1..12])
AverageMonthlyConsumption = AnnualConsumption / 12
ProjectedYearEndBalance = YearlyAllocation - AnnualConsumption
```

**Section sources**
- [tambah/page.tsx:66-69](file://app/anggaran/tambah/page.tsx#L66-L69)
- [api.ts:499-506](file://lib/api.ts#L499-L506)

## Data Validation and Entry Patterns

### Form Field Specifications

| Field | Type | Validation Rules | Required |
|-------|------|------------------|----------|
| Tahun | Number | 2018-present | Yes |
| Bulan | Select | 1-12 range | Yes |
| DIPA | Select | DIPA 01 or DIPA 04 | Yes |
| Kategori | Select | Category based on DIPA | Yes |
| Realisasi | Number | >0, numeric | Yes |
| Link Dokumen | URL | Valid URL format | No |
| Keterangan | Text | Max 500 chars | No |

### Validation Logic Implementation

The validation system implements comprehensive field checking:

```mermaid
flowchart TD
ValidateForm[Validate Form Submission] --> CheckRequired{Check Required Fields}
CheckRequired --> |Missing| ShowRequired[Show Required Field Errors]
CheckRequired --> |Complete| CheckFormat{Check Field Formats}
CheckFormat --> |Invalid| ShowFormat[Show Format Errors]
CheckFormat --> |Valid| CheckRange{Check Value Ranges}
CheckRange --> |Invalid| ShowRange[Show Range Errors]
CheckRange --> |Valid| CheckPagu{Check Pagu Limits}
CheckPagu --> |Exceeded| ShowPagu[Show Pagu Exceeded Error]
CheckPagu --> |Within Limit| SubmitForm[Submit Form]
ShowRequired --> Wait[Wait for Correction]
ShowFormat --> Wait
ShowRange --> Wait
ShowPagu --> Wait
Wait --> ValidateForm
```

**Diagram sources**
- [tambah/page.tsx:71-106](file://app/anggaran/tambah/page.tsx#L71-L106)

**Section sources**
- [tambah/page.tsx:19-37](file://app/anggaran/tambah/page.tsx#L19-L37)

## Integration with Financial Systems

### API Integration Points

The Anggaran module integrates with multiple backend systems:

```mermaid
graph LR
subgraph "Anggaran Frontend"
A[Anggaran List]
B[Add Realisasi]
C[Edit Realisasi]
D[Pagu Configuration]
end
subgraph "Backend Services"
E[Anggaran API]
F[Pagu API]
G[Document Storage]
H[User Management]
end
subgraph "External Systems"
I[Financial Database]
J[Document Repository]
K[Reporting Engine]
end
A --> E
B --> E
C --> E
D --> F
E --> I
F --> I
E --> J
F --> I
E --> K
F --> K
```

**Diagram sources**
- [api.ts:429-523](file://lib/api.ts#L429-L523)

### Compliance and Audit Trail

The system maintains comprehensive audit trails for all financial transactions:

| Audit Event | Data Captured | Retention Period |
|-------------|---------------|------------------|
| Budget Entry | User, Timestamp, Values, IP | 7 years |
| Modification | Previous/Current Values, Modifier | 7 years |
| Deletion | Deletion Details, Reason | Permanent |
| Pagu Changes | New Limits, Approving Authority | 7 years |

**Section sources**
- [api.ts:429-523](file://lib/api.ts#L429-L523)

## Reporting and Compliance

### Budget Categories and Hierarchies

The system supports two primary budget categories with distinct approval hierarchies:

**DIPA 01 Categories:**
- Belanja Pegawai (Employee Expenses)
- Belanja Barang (Material Purchases)
- Belanja Modal (Capital Expenditures)

**DIPA 04 Categories:**
- POSBAKUM (Court Case Related Expenses)
- Pembebasan Biaya Perkara (Case Cost Release)
- Sidang Di Luar Gedung (Off-site Court Sessions)

### Approval Workflow Hierarchy

```mermaid
flowchart TD
subgraph "Approval Levels"
Level1[Staff Level 1]
Level2[Staff Level 2]
Level3[Supervisor]
Level4[Head of Department]
Level5[Finance Officer]
end
subgraph "Budget Thresholds"
T1[0 - 50% of Pagu]
T2[50% - 80% of Pagu]
T3[80% - 100% of Pagu]
T4[100%+ of Pagu]
end
Level1 --> T1
Level2 --> T2
Level3 --> T3
Level4 --> T4
Level5 --> T4
```

**Section sources**
- [tambah/page.tsx:34-37](file://app/anggaran/tambah/page.tsx#L34-L37)
- [edit/page.tsx:24-27](file://app/anggaran/[id]/edit/page.tsx#L24-L27)

## Performance Considerations

### Data Loading Optimization

The system implements several performance optimization strategies:

**Pagination Strategy:**
- Default page size: 15 records
- Lazy loading for large datasets
- Efficient filtering on client-side
- Debounced search operations

**Memory Management:**
- Component cleanup on unmount
- Efficient state updates
- Minimal re-renders through proper state management

**API Optimization:**
- Request deduplication
- Efficient query parameters
- Proper error handling and retry logic

### Scalability Features

- Horizontal scaling support for multiple budget categories
- Database indexing for frequently queried fields
- CDN integration for document storage
- Caching strategies for configuration data

## Troubleshooting Guide

### Common Issues and Solutions

**Issue: Pagu Limit Not Updating**
- **Cause**: Browser caching or stale data
- **Solution**: Clear browser cache or refresh page
- **Prevention**: Implement automatic data refresh

**Issue: Form Validation Errors**
- **Cause**: Missing required fields or invalid formats
- **Solution**: Check console for specific error messages
- **Prevention**: Implement real-time validation feedback

**Issue: API Connection Failures**
- **Cause**: Network issues or server downtime
- **Solution**: Check API status and retry connection
- **Prevention**: Implement connection retry logic

**Issue: Document Upload Failures**
- **Cause**: File size limits or unsupported formats
- **Solution**: Verify file type and size constraints
- **Prevention**: Implement client-side validation

### Debugging Tools

The system includes comprehensive debugging capabilities:

- **Console Logging**: Detailed API response logging
- **Error Boundaries**: Graceful error handling
- **Network Monitoring**: API request/response tracking
- **State Inspection**: Real-time state visualization

**Section sources**
- [page.tsx:63-70](file://app/anggaran/page.tsx#L63-L70)
- [tambah/page.tsx:102-106](file://app/anggaran/tambah/page.tsx#L102-L106)

## Conclusion

The Anggaran module provides a comprehensive, enterprise-grade budget management solution tailored for judicial institutions. The system successfully balances functionality with usability while maintaining strict compliance with financial regulations.

Key strengths of the implementation include:

- **Robust Pagu Control**: Advanced budget limit enforcement preventing overspending
- **Comprehensive Audit Trail**: Complete transaction history for compliance requirements
- **User-Friendly Interface**: Intuitive forms with real-time validation feedback
- **Scalable Architecture**: Designed to handle growing budget complexity
- **Integration Capabilities**: Seamless connection with existing financial systems

The module's modular design ensures maintainability and extensibility, allowing for future enhancements such as advanced reporting features, multi-level approval workflows, and enhanced analytics capabilities.