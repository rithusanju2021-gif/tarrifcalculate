# 🚗 Rithish Tours & Travels — Vehicle Distance & Tour Tariff Calculator

A private, enterprise-grade full-stack vehicle road distance calculator and South India tour itinerary planner built specifically for **Rithish Tours & Travels**.

---

## 🔒 Strict Website Protection Rule
- **Existing business website [https://rithishtoursandtravels.in/](https://rithishtoursandtravels.in/) is completely untouched.**
- No modifications to its cPanel, Apache, `.htaccess`, DNS, HTML, CSS, JavaScript, or hosting server.
- This application runs independently on its own free serverless frontend, containerized backend, and isolated cloud database.

---

## 🌟 Key Architecture & Features

### 1. Two Independent Calculators
- **One-Day Trip Calculator**:
  - Starting location, multiple sightseeing destinations, and optional return journey.
  - Computes exact road distance across each leg dynamically.
  - Recalculates immediately upon adding, removing, or reordering stops.
- **Multi-Day Tour Package Calculator**:
  - Multi-day tours across Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana, and Puducherry.
  - Multiple destinations per day with overnight halt selection.
  - Independent per-day road distance calculation and per-day rental method selection.
  - Day-wise breakdown table and grand tour totals.

### 2. Tariff Calculation Rules & Pricing Methods
Each vehicle has configurable tariff attributes:
1. **Day Rent (₹)**
2. **Fuel Cost per KM (₹)**
3. **Included KM Limit per Day** (e.g. 200, 250, 300, 350, 400 km — never hardcoded)
4. **KM Rate for Method 2 (₹)**
5. **Driver Bata (₹)**

#### Two Calculation Methods:
- **Method 1 (Within Included Limit):**
  $$\text{Daily Cost} = \text{Day Rent} + (\text{Actual KM} \times \text{Fuel Rate}) + \text{Driver Bata}$$
- **Method 2 (Exceeding Included Limit):**
  $$\text{Daily Cost} = (\text{Entire Actual KM} \times \text{KM Rate}) + \text{Driver Bata}$$
  *(Applied to the entire day's distance; day rent and fuel cost are not added in Method 2).*
- **Manual Method Override**: Ability to switch between Method 1 and Method 2 at any time.

### 3. Road Distance Engine
- OpenStreetMap routing data via **OSRM driving route API**.
- Nominatim geocoding prioritized for South India cities and tourist spots.
- Persistent **RouteCache** in the database to store calculated distances and eliminate redundant API calls.
- Clear status badges:
  - 🟢 **LIVE**: Calculated live from OSRM road routing engine.
  - 🟡 **CACHED**: Retrieved instantly from the route cache database.
  - 🔵 **MANUAL**: Manually entered or adjusted distance.
- Direct client fallback if backend is waking up from sleep.

### 4. Vehicle Fleet Management
- Unlimited vehicles: Swift Dzire, Toyota Etios, Maruti Ertiga, Toyota Innova, Innova Crysta, Tempo Traveller (12 & 17-seater), Force Urbania, and custom additions.
- Dedicated tariff configuration for each vehicle.
- Soft-delete (disable/enable) and delete operations.

### 5. Export, Save & Backup
- Save one-day and multi-day tours with persistent storage in the database and browser `localStorage`.
- Professional downloadable **PDF quotation & itinerary report** generated via ReportLab.
- One-click copy-ready **WhatsApp quotation text** with emojis and bold formatting.
- **Export Backup** and **Import Backup** via JSON files.
- **Clear All Data** option with confirmation modal.

### 6. Dynamic Light & Dark Theme
- One-click toggle between **Dark Mode** (luxury night slate) and **Light Mode** (clean daylight theme).
- State persisted in `localStorage` (`rtt_theme`) with instant zero-flicker restoration.
- Accessible directly from the top navigation bar and the staff login screen.

### 7. Zero-Cost Production Stack (₹0 / Month)
- **Frontend**: Vercel Free Tier (SSL, global CDN, 100 GB/month bandwidth).
- **Backend**: Render Free Web Service (Django 5 REST API + Gunicorn + WhiteNoise).
- **Database**: Aiven MySQL 8 Free Plan (1 GB persistent storage, automated backups, SSL encryption).

---

## 💻 Local Development Guide (Windows 11 / PowerShell)

### Prerequisites
- Node.js 18+ (tested with v20 / v22)
- Python 3.10, 3.11, or 3.12
- Git for Windows

---

### Step A: Local Django Backend Setup

1. Open PowerShell and navigate to the project directory:
   ```powershell
   cd C:\Users\Rithish.M\Downloads\RTTTarrif
   ```

2. Activate the virtual environment:
   ```powershell
   .\backend\venv\Scripts\Activate.ps1
   ```
   *(If script execution is disabled, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

3. Run Django system checks and migrations:
   ```powershell
   .\backend\venv\Scripts\python.exe backend\manage.py check
   .\backend\venv\Scripts\python.exe backend\manage.py migrate
   ```

4. Start the Django development server:
   ```powershell
   .\backend\venv\Scripts\python.exe backend\manage.py runserver 127.0.0.1:8000
   ```
   API Health Check: [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)

---

### Step B: Local React Frontend Setup

1. Open a second PowerShell window and navigate to the project root:
   ```powershell
   cd C:\Users\Rithish.M\Downloads\RTTTarrif
   ```

2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

4. Open the application in your browser:
   [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

5. **Staff Credentials for Local Testing:**
   - **Username:** `admin`
   - **Password:** `rttadmin2026`

---

## 🚀 Step-by-Step Production Deployment Guide (₹0 / Month)

---

### Step C: GitHub Repository Upload

1. Initialize git and commit files:
   ```powershell
   cd C:\Users\Rithish.M\Downloads\RTTTarrif
   git init
   git add .
   git commit -m "feat: complete deployment preparation for RTT Tariff Calculator"
   ```

2. Create a new **Private** repository on GitHub named `rtt-tariff-calculator` (or your preferred name).

3. Link the remote and push your code:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/rtt-tariff-calculator.git
   git push -u origin main
   ```

---

### Step D: Aiven MySQL 8 Free Tier Setup

1. Go to [https://aiven.io/](https://aiven.io/) and create a free account (no credit card required).
2. Click **Create Service**:
   - **Service:** MySQL 8
   - **Cloud Provider & Region:** AWS or Google Cloud (choose `ap-south-1` / Mumbai or closest free tier region)
   - **Plan:** Free Plan (1 GB storage, 1 CPU)
   - **Service Name:** `rtt-mysql-db`
3. Click **Create Service**.
4. Once active, locate the **Service URI** in your Aiven overview:
   - Format: `mysql://avnadmin:YOUR_PASSWORD@YOUR_HOST:28761/defaultdb?ssl-mode=REQUIRED`
5. Keep this URI handy for Step E.

---

### Step E: Render Free Web Service Deployment (Backend)

1. Go to [https://render.com/](https://render.com/) and sign up or log in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and select your repository: `rtt-tariff-calculator`.
4. Configure the service settings:
   - **Name:** `rtt-tariff-api`
   - **Region:** Singapore or Frankfurt (Free tier)
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 --log-file -`
   - **Plan:** `Free`
5. Click **Advanced** → **Add Environment Variable**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `DEBUG` | `False` | Enforces production mode and security guards |
   | `SECRET_KEY` | *(Click "Generate" in Render)* | Unique 50+ character random secret |
   | `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` | Allows Render subdomains |
   | `DATABASE_URL` | `mysql://avnadmin:pass@host:port/defaultdb?ssl-mode=REQUIRED` | From Aiven Service URI (or leave empty for SQLite) |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Updated in Step F with your Vercel URL |
   | `CSRF_TRUSTED_ORIGINS` | `https://your-frontend.vercel.app` | Updated in Step F with your Vercel URL |
   | `DJANGO_SUPERUSER_USERNAME` | `admin` | Initial staff admin username |
   | `DJANGO_SUPERUSER_PASSWORD` | `YourSecurePassword2026!` | Initial staff admin password |
   | `DJANGO_SUPERUSER_EMAIL` | `staff@rithishtoursandtravels.in` | Admin email |
6. Click **Create Web Service**.
7. Render will execute `./build.sh` (installs dependencies, collects static assets via WhiteNoise, runs database migrations on Aiven MySQL, and provisions the initial superuser).
8. Verify your live health endpoint:
   `https://rtt-tariff-api.onrender.com/api/health/`

---

### Step F: Vercel Free Frontend Deployment

1. Go to [https://vercel.com/](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `rtt-tariff-calculator` repository.
4. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (Leave as root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. In **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://rtt-tariff-api.onrender.com/api` |
6. Click **Deploy**.
7. Once deployed, copy your live Vercel production URL (e.g. `https://rtt-tariff-calculator.vercel.app`).
8. Return to Render Dashboard → Environment Variables:
   - Update `CORS_ALLOWED_ORIGINS` to include your Vercel URL: `https://rtt-tariff-calculator.vercel.app`
   - Update `CSRF_TRUSTED_ORIGINS` to include: `https://rtt-tariff-calculator.vercel.app`
   - Render will automatically trigger a zero-downtime redeploy.

---

### Step G: Prevent Render Free Tier Sleeping (Zero-Cost Keep-Alive)
Render free web services spin down after 15 minutes of inactivity. To keep your API hot and responsive at ₹0 cost:
1. Go to [https://uptimerobot.com/](https://uptimerobot.com/) and create a free account.
2. Click **Add New Monitor**:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** `RTT Tariff API Keep-Alive`
   - **URL (or IP):** `https://rtt-tariff-api.onrender.com/api/health/`
   - **Monitoring Interval:** Every 10 minutes
3. Save the monitor. Your Django backend will remain awake 24/7 with instant sub-second response times!

---

## 🧪 Automated Testing & Verification

### Run Django System Check:
```powershell
cd C:\Users\Rithish.M\Downloads\RTTTarrif
.\backend\venv\Scripts\python.exe backend\manage.py check
```
*Result: `System check identified no issues (0 silenced).`*

### Run Calculator Unit Tests:
```powershell
cd C:\Users\Rithish.M\Downloads\RTTTarrif
.\backend\venv\Scripts\python.exe backend\manage.py test calculator
```
*Result: `Ran 6 tests in 0.002s — OK`*
- Tests Method 1 calculation within included KM limit.
- Tests Method 2 calculation exceeding included KM limit.
- Tests exact boundary condition ($km = limit$).
- Tests customizable included KM limits ($200, 250, 400\text{ km}$).
- Tests manual calculation method overrides.
- Tests multi-day tours with independent per-day methods and totals.

### Run Frontend Production Build:
```powershell
cd C:\Users\Rithish.M\Downloads\RTTTarrif
npm run build
```
*Result: Zero errors, clean build to `dist/`.*

---

## 🛠️ Troubleshooting Common Deployment Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **CORS error on browser console** | `CORS_ALLOWED_ORIGINS` on Render does not match your Vercel domain. | Add `https://your-domain.vercel.app` (without trailing slash) to `CORS_ALLOWED_ORIGINS` on Render. |
| **API request timeout on first load** | Render free instance was asleep (cold boot takes ~30-45 seconds). | Add a free UptimeRobot monitor pinging `/api/health/` every 10 minutes. The frontend also has a built-in direct OSRM fallback for road distance. |
| **Aiven MySQL SSL connection error** | Missing SSL CA certificate path or incompatible mode. | Ensure `?ssl-mode=REQUIRED` is on `DATABASE_URL` or `DB_SSL_CA` points to `/etc/ssl/certs/ca-certificates.crt`. |
| **Vercel 404 on page refresh** | SPA routing rewrite missing. | Verified: `vercel.json` already contains `{ "source": "/(.*)", "destination": "/index.html" }`. |
| **Static files 404 in Django Admin** | WhiteNoise not enabled or static files uncollected. | Verified: `build.sh` runs `collectstatic --no-input` and WhiteNoise is positioned right below security middleware. |

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
