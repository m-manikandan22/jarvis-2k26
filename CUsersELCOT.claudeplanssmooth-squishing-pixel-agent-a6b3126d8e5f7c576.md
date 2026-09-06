# Migration Plan: JARVIS 2K26 Registration System (Flat-file to Relational)

## Overview
Migrate the current single-row Google Sheet registration system to a normalized relational structure. This will support multi-event participation, team-based registration, and a secure payment workflow.

## 1. Database Schema Setup (`backend/setup.gs`)
Update `setupDB` to implement the following 5 sheets:

### Sheet Definitions
| Sheet | Columns (Headers) | Purpose |
| :--- | :--- | :--- |
| **Teams** | `TeamID (PK), TeamName, CreatedAt, CaptainMemberID (FK)` | Stores team metadata |
| **Members** | `MemberID (PK), TeamID (FK), FullName, CollegeName, Department, YearOfStudy, Email, Phone` | Stores individual member details |
| **RegistrationEvents** | `RegEventID (PK), TeamID (FK), MemberID (FK), EventID, Session, Timestamp` | Links members to events |
| **Payments** | `PaymentID (PK), TeamID (FK), TotalAmount, UTR_Reference, ScreenshotURL, Status, PaidAt, VerifiedAt` | Tracks payment status |
| **Config** | `Key, Value` | Stores system constants (`UPI_ID`, `BASE_TEAM_FEE`, `EVENT_PRICES`) |

### Implementation Steps
- Modify `SCHEMA_HEADERS` to be a map of sheet names to header arrays.
- Update `verifyRegistrationsSheet_` to a generic `verifySheet_(ss, name, headers)` function.
- Initialize `Config` sheet with:
    - `UPI_ID`: (e.g., `jarvis@upi`)
    - `BASE_TEAM_FEE`: (e.g., `500`)
    - `EVENT_PRICES`: JSON string mapping event IDs to prices.

## 2. Core API & Transaction Logic (`backend/Code.gs`)
Refactor `doPost` to implement an atomic registration transaction.

### Atomic Transaction Flow
1. **Locking**: Wrap the entire process in `LockService.getScriptLock().waitLock(10000)`.
2. **Input Validation**:
    - Validate all required fields.
    - **Slot Validation**: Ensure `MemberID + Session` is unique across `RegistrationEvents`.
    - **Identity Duplicate**: Ensure `TeamID + Email` is unique in `Members`.
3. **Relational Insertion (Sequential)**:
    - **Step A (Team)**: Create entry in `Teams` $\rightarrow$ get `TeamID`.
    - **Step B (Members)**: Create entries for all team members in `Members` $\rightarrow$ get `MemberIDs`.
    - **Step C (Events)**: For each selected event, insert rows for every member in `RegistrationEvents` (Model A).
    - **Step D (Payment)**:
        - Fetch prices from `Config`.
        - Calculate `Total = BASE_TEAM_FEE + sum(Event Prices)`.
        - Create entry in `Payments` with `Status = 'Pending'` $\rightarrow$ get `PaymentID`.
4. **Response**: Return `{ status: 'success', paymentId: '...', totalAmount: '...' }`.
5. **Unlock**: `lock.releaseLock()`.

## 3. Validation Logic Implementation
- **Slot Constraint**: 
  - `Query: SELECT * FROM RegistrationEvents WHERE MemberID = ? AND Session = ?`
  - If results > 0, reject registration.
- **Identity Constraint**: 
  - `Query: SELECT * FROM Members WHERE TeamID = ? AND Email = ?`
  - If results > 0, reject registration.
- **Event Duplicate**:
  - `Query: SELECT * FROM RegistrationEvents WHERE TeamID = ? AND MemberID = ? AND EventID = ? AND Session = ?`

## 4. Payment & Screenshot Workflow
### Price Calculation
- Use a helper function `calculateTotal_(eventIds)` that reads `EVENT_PRICES` from the `Config` sheet.

### Screenshot Upload API
Implement a new `doPost` action `action: 'uploadPayment'`:
1. **Input**: `paymentId`, `utrReference`, `base64Image`.
2. **Processing**:
    - Use `DriveApp.getFolderById(PAYMENTS_FOLDER_ID).createFile(blob)`.
    - Store resulting `file.getUrl()` in `Payments` sheet.
    - Update `Status = 'Pending'`, `UTR_Reference = utrReference`, `PaidAt = now`.
3. **Response**: Return confirmation of upload.

## 5. Frontend Transition (`src/components/RegistrationForm.jsx`)
Convert the flat form into a multi-step wizard.

### Wizard Steps
1. **Step 1: Team Info** $\rightarrow$ Team Name.
2. **Step 2: Captain Info** $\rightarrow$ Detailed member form (Name, College, etc.).
3. **Step 3: Team Members** $\rightarrow$ Dynamic list of member names/emails.
4. **Step 4: Event Selection** $\rightarrow$ Morning/Evening checkboxes (maintain session limits).
5. **Step 5: Payment** $\rightarrow$ Display `TotalAmount`, UPI QR/ID, UTR input, and file upload for screenshot.

### Technical Changes
- **State Management**: Use `currentStep` state to conditionally render step components.
- **Payload Update**:
  - First call: `POST /register` $\rightarrow$ returns `paymentId` and `totalAmount`.
  - Second call: `POST /uploadPayment` $\rightarrow$ sends screenshot and UTR.
- **UI/UX**: Use `framer-motion` for smooth step transitions; keep Neon/Tailwind styling.

## 6. Verification Plan
### Backend Tests
- [ ] **Setup**: Run `setupDB` $\rightarrow$ Verify 5 sheets with correct headers.
- [ ] **Atomicity**: Trigger a failure in Step C $\rightarrow$ Verify no partial data exists in `Teams` or `Members`.
- [ ] **Slot Validation**: Attempt to register one member for 2 morning events $\rightarrow$ Verify rejection.
- [ ] **Identity Check**: Register a person in Team A, then try to register the same person in Team A again $\rightarrow$ Verify rejection.
- [ ] **Multi-Team**: Register a person in Team A, then register them in Team B $\rightarrow$ Verify success.

### Payment Tests
- [ ] **Pricing**: Select specific events $\rightarrow$ Verify `TotalAmount` matches `Config` sheet values.
- [ ] **Upload**: Upload a test image $\rightarrow$ Verify file exists in Google Drive and URL is in `Payments` sheet.

### Frontend Tests
- [ ] **Wizard Flow**: Complete registration from Step 1 to 5 $\rightarrow$ Verify all data is sent correctly.
- [ ] **Persistence**: Go back and forth between steps $\rightarrow$ Verify data is not lost.
