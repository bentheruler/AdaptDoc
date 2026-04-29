# Admin Dashboard Implementation Plan (Real Analytics)

This plan details the implementation of the Admin Dashboard using **100% real data**. We will create new models to properly log AI usage and system settings instead of mocking data.

## Proposed Changes

### Database & Model Changes

#### [MODIFY] `backend/models/User.js`
- Add `status: { type: String, enum: ['active', 'restricted'], default: 'active' }`.

#### [NEW] `backend/models/AIRequestLog.js`
- `user`: ObjectId (ref: 'User')
- `provider`: String ('gemini', 'openai')
- `documentType`: String
- `success`: Boolean
- `errorMessage`: String
- `latencyMs`: Number
- `createdAt`: Date (default: Date.now)

#### [NEW] `backend/models/SystemSetting.js`
- `key`: String (unique)
- `value`: Schema.Types.Mixed (to store boolean or string values)
- Keys to seed/manage: `preferredProvider` ('gemini' | 'openai' | 'auto'), `fallbackEnabled` (Boolean), `maintenanceMode` (Boolean).

---

### Backend (`backend/`)

#### [MODIFY] `backend/middleware/authMiddleware.js`
- Check if the authenticated user's `status` is `restricted`. If so, reject the request with a `403 Forbidden` error (blocking login/access).

#### [MODIFY] `backend/server/services/ai/FailoverManager.js` & `backend/server/controllers/aiController.js`
- **Settings Integration**: Fetch `preferredProvider` and `fallbackEnabled` from `SystemSetting` to dictate AI routing logic.
- **Latency Tracking**: Record start time before calling AI, and end time after.
- **Database Logging**: Create an `AIRequestLog` document containing provider used, success/failure, error message (if any), doc type, and `latencyMs`.

#### [MODIFY] `backend/server/routes/adminRoutes.js`
Update to include the following secured endpoints (using `authMiddleware` + `adminMiddleware`):
- `GET /stats`: Real counts for total users, total documents, CVs, cover letters, proposals, active users, restricted users, and documents created today/this week.
- `GET /users`: Return users with masked emails (e.g., `b***@gmail.com`), masked names, role, status, created date, and their document count.
- `PUT /users/:id/status`: Update user status to `active` or `restricted` (prevent admins from restricting themselves).
- `GET /documents`: Return documents with titles, types, masked owner names, created/updated dates.
- `DELETE /documents/:id`: Delete abusive or unnecessary documents.
- `GET /ai-logs`: Fetch raw AI logs and aggregate data (provider success vs failure, avg latency by provider, AI requests/failures per day, AI usage by doc type).
- `GET /settings`: Fetch real SystemSettings.
- `PUT /settings`: Update SystemSettings.

---

### Frontend (`frontend/src/`)

#### [MODIFY] `package.json`
- Install `recharts` for AI logging charts.

#### [NEW] `pages/admin/AdminDashboardPage.jsx`
Create a tabbed admin interface:
- **Overview**: Real stats from MongoDB.
- **Users**: Table with masked data, document counts, and action buttons to Restrict/Activate/Delete.
- **Documents**: Table with masked owner data and an action to Delete.
- **AI Logs**: Use `recharts` to render real logged data (Success vs Failure, Latency, Usage by Doc Type). Empty states will display "No AI usage has been recorded yet" if no logs exist.
- **Settings**: Toggles for Maintenance Mode, Fallback Enabled, and a select dropdown for Preferred Provider.

#### [MODIFY] `pages/dashboard/DashboardPage.jsx`
- Render `<AdminDashboardPage />` when `activeTab === 'admin'`.

---

## Route List

### Frontend Routes/Tabs
- `/dashboard` (Tab: `admin` -> Overview, Users, Documents, AI Logs, Settings)

### Backend Routes (`/api/admin`)
- `GET /stats`
- `GET /users`
- `PUT /users/:id/status`
- `DELETE /users/:id`
- `GET /documents`
- `DELETE /documents/:id`
- `GET /ai-logs`
- `GET /settings`
- `PUT /settings`

---

## Verification Plan
1. Validate that newly registered users default to `active`.
2. Generate a document, and verify an `AIRequestLog` entry is created with the correct latency, provider, and success state.
3. Restrict a user via the Admin Panel and verify they can no longer generate documents or login.
4. Verify that names and emails in the Users and Documents admin tabs are successfully masked.
5. Change `preferredProvider` to `openai` via Admin Settings and verify the backend logs show `openai` being used.

---

## Implementation Order
1. **Phase 1: DB Models** - Create `SystemSetting` and `AIRequestLog` schemas; update `User` schema.
2. **Phase 2: Core Logic & Tracking** - Update `aiController`/`FailoverManager` to log AI metrics and read real system settings. Update auth middleware to block restricted users.
3. **Phase 3: Admin API** - Implement `/api/admin` routes ensuring strict masking of PII and accurate aggregations.
4. **Phase 4: Admin Frontend** - Build `AdminDashboardPage.jsx`, integrating tables, charts, and setting controls.
