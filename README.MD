# Audit-Lite-Buddy

Audit-Lite-Buddy is a mobile-ready energy audit tool designed for conducting **Level 1 Walkthrough Energy Audits** in residential, commercial, and institutional buildings. It enables auditors to document equipment, operating conditions, and building observations while automatically calculating estimated energy consumption and identifying savings opportunities.

The application is optimized for **field use**, supports **photo documentation**, and includes tools for **reporting and CSV export** for offline analysis or client presentations.

---

## ✨ Key Features

### Project Management
- Create and manage audit projects (client, facility, tariff details, auditor names)
- Track audit progress and archive completed audits

### Area & Equipment Inventory
- Add building areas (e.g., Kitchen, Server Room, Office, Shop Floor)
- Record equipment with:
  - Quantity
  - Wattage (W)
  - Hours of operation per day
  - Days per week of operation
  - Condition & notes
- **Automatic kWh/day and kWh/month calculation**
- Upload and display photos of equipment and building areas

### Observations & Recommendations
- Document ventilation, comfort, lighting adequacy, and maintenance issues
- Add energy efficiency recommendations with estimated savings (kWh & GHS)

### Reporting & Analysis
- Visual energy consumption summaries & charts
- Editable data tables
- Export full audit report to `.csv` for external analysis
- Photo gallery view with location & device labels

### Mobile-Ready UI
- Fully responsive interface for use on phones, tablets, and laptops

---

## 🧩 Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | React + TypeScript + Vite |
| UI Framework | shadcn-ui + Tailwind CSS |
| Backend | Supabase (Postgres + Auth + Row Level Security) |
| File Storage | Supabase Storage (public thumbnails, secure uploads) |
| Deployment & App Editing | Lovable.dev Platform |

---

## 📦 Installation (Developer Setup)

To work on the code locally:

```bash
# Clone the repository
git clone <REPO_URL>
cd audit-lite-buddy

# Install dependencies
npm install

# Start development server
npm run dev

Make sure you set up your Supabase environment variables in `.env.local`.

### 📤 Deployment  
This project can be deployed directly from Lovable:  
- Open the project in Lovable  
- Click **Share → Publish**  
- Optionally connect a custom domain at  
  **Project → Settings → Domains**

### 📄 License  
This project is licensed under the **MIT License**.  
See the [LICENSE](./LICENSE) file for details.

### 🤝 Maintainer  
Johnathan Lightfoot  
Listings Pro GHH  
Email: johnathan@listingsprogh.com
