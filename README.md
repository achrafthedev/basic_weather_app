# 🌦️ SkyFlow - Premium Weather Dashboard

SkyFlow is a modern, high-fidelity single-page weather application that translates real-time coordinates into comprehensive meteorological insights. Leveraging a glassmorphic aesthetic, the dashboard responds dynamically to weather conditions and ambient times, offering an engaging user experience.

The application operates entirely on the client side, using free, keyless geocoding and forecast APIs provided by **Open-Meteo**.

---

## ✨ Features

- **Global City Search & Autocomplete:** Typahead search matching administrative regions, country names, and flag emojis (e.g., `Paris, Île-de-France, 🇫🇷 France`) for quick discovery.
- **Dynamic Glassmorphic Theme:** Background gradients and card overlays automatically change depending on current weather conditions (Clear, Cloudy, Rainy, Snowy, Stormy) and local day/night status.
- **Detailed Meteorological Parameters:** Dashboard displays apparent temperature ("feels like"), wind speed, relative humidity, UV index, atmospheric surface pressure, visibility, and precise local sunrise/sunset times.
- **Interactive Multi-Axis Charting:** Integrated Chart.js visualization plotting 24-hour temperature curves alongside precipitation probability overlays.
- **Metric & Imperial System Toggle:** Instantly switch calculations and displays between metric (`°C`, `km/h`, `km`, `hPa`) and imperial (`°F`, `mph`, `mi`, `inHg`) standards.
- **Geolocation Integration:** Automatically detect coordinates and pull local forecasts with a single click.
- **Search History Caching:** Saved searches are stored locally in the browser for rapid quick-access shortcuts.

---

## 🛠️ Stack & Technologies

- **Core Structure:** HTML5 (Semantic Markup)
- **Styling:** Custom CSS3 Variables, Responsive Flexbox & Grid layouts, Glassmorphic filters
- **Logic:** Vanilla JavaScript (ES6 Modules, Fetch API, LocalStorage, Navigator Geolocation)
- **Visuals & Charts:** Chart.js (multi-axis line graphs with dynamic gradients)
- **Iconography:** Lucide Icons (SVG vector weather and interface symbols)
- **External Data Providers:** Open-Meteo Geocoding and Forecast APIs

---

## 📋 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/achrafthedev/skyflow.git
```

### 2️⃣ Navigate to the Directory
```bash
cd skyflow
```

### 3️⃣ Launch the App

#### Option A: Running Directly
No build tools or servers are required! Simply open the `index.html` file in any modern web browser.
- Double-click `index.html` in your file explorer.
- Or host a local static server (e.g., using VS Code's Live Server extension, Python's `http.server`, or similar).

#### Option B: Running with Docker 🐳
This project is fully containerized. To spin up the weather dashboard locally:

1. **Build and Run via Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```
2. **Access the Application:**
   Open your browser and navigate to [http://localhost:8082](http://localhost:8082).

3. **Stop the Container:**
   ```bash
   docker-compose down
   ```

---

## 📂 Architecture & Files

```
skyflow/
├── index.html          # HTML5 structure, semantic panels, libraries integration (Chart.js & Lucide)
├── style.css           # Premium CSS design tokens, dynamic themes, responsive configurations
├── script.js           # Autocomplete debounce engine, unit-toggles, chart rendering, API integrations
├── Dockerfile          # Configuration to serve static files inside Nginx Alpine container
└── docker-compose.yml  # Local deployment definition mapping service to port 8082
```

---

## 🌐 API Integrations

### **1. Geocoding Autocomplete Search**
Queries matching cities around the globe:
`https://geocoding-api.open-meteo.com/v1/search?name={query}&count=6&language=en&format=json`

### **2. Forecast Data**
Queries detailed forecast arrays:
`https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,uv_index,surface_pressure,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone={timezone}&temperature_unit={tempUnit}&windspeed_unit={windUnit}&precipitation_unit={precipUnit}`

---

## 📄 License

This project is licensed under the **MIT License**. You are free to copy, modify, and distribute it.
