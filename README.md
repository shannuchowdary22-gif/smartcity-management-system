<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/19f88a3d-274a-4657-b25d-b8d4c81a34ec

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Smart City REST Integration

The React app runs from `_Source_Code/Frontend` on port `3000`. Its centralized client calls the Spring Boot API at `http://localhost:8080`. The API project is `_Source_Code/Backend`; MySQL connection settings are environment variables and no database password is stored in the project.

### Start the backend (PowerShell)

Open PowerShell in the repository root and enter:

```powershell
$securePassword = Read-Host "MySQL DB_PASSWORD" -AsSecureString
$env:DB_PASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
$env:ADMIN_CLEARANCE_CODE = Read-Host "Long random ADMIN_CLEARANCE_CODE"
$env:MUNICIPAL_BOOTSTRAP_ENABLED = "true"
Set-Location .\_Source_Code\Backend
mvn spring-boot:run
```

By default the backend uses MySQL at `localhost:3306`, database `smartcity`, and user `smartcity`. Override `DB_HOST`, `DB_PORT`, `DB_NAME`, and `DB_USERNAME` in that terminal if the existing MySQL setup uses different values. `CORS_ALLOWED_ORIGIN` defaults to `http://localhost:3000`.

Set a private, high-entropy `ADMIN_CLEARANCE_CODE` and enable `MUNICIPAL_BOOTSTRAP_ENABLED` on the backend for first-officer setup. There is intentionally no default/demo key. The clearance code is entered into the restricted bootstrap form and verified only by the backend; after one successful registration the bootstrap lock closes permanently. The first officer is signed in automatically with the selected account password. Subsequent officers must be commissioned by an authenticated administrator. Successful admin sign-in issues an 8-hour bearer session; sessions are held in memory and must be renewed after a backend restart. Complaint proof accepts PNG, JPEG, or WebP images up to 5 MB and is stored in MySQL with the complaint. `RESOLUTION_PROOF_REQUIRED` defaults to `true`.

### Start the frontend

In a second PowerShell window:

```powershell
Set-Location .\_Source_Code\Frontend
npm run dev
```

### Complaint and work-order data flow

`POST /api/complaints` validates the report and proof, stores it in the `complaints` table, sets `submitted`, and returns a unique `CMP-...` ID plus a one-time receipt token. Keep that receipt private; it is returned only at creation and is required in the `X-Complaint-Receipt` header for `GET /api/complaints/{id}/status`. The frontend stores it locally per citizen account so that account can refresh its own status without exposing other residents' complaint details.

`POST /api/auth/admin-session` exchanges an email and the account password for the admin bearer token. All `/api/admin/**` endpoints, including complaint lists/details, resolver assignment, work-order creation/update, and priority/status changes, require that token. Work orders live in `work_orders` and have a unique constraint on `complaint_id`, so retrying creation returns the existing order instead of creating a duplicate. Resolving an order requires notes and, by default, resolution proof; its status, notes, and proof are applied to the linked complaint in the same transaction.

The previous generic `/api/grievances` collection remains restricted to municipal sessions. The dedicated complaint API is the source of truth for citizen submissions and resolver work orders.

### Test

Run `mvn test` in `_Source_Code/Backend` to execute the full API workflow against an isolated H2 database (no MySQL test data is created). The integration test checks submission, ID/receipt generation, proof validation and retrieval, admin authorization, resolver assignment, idempotent work-order creation, progress/resolution, persistence on reload, citizen status access, and rejected unauthorized/invalid requests.

The React portal is started from `_Source_Code/Frontend` with `npm run dev`; its centralized client calls `http://localhost:8080`. Other demo telemetry and actuator controls remain browser-side until they have dedicated persistence endpoints.
