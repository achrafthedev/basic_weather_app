// State Management
const state = {
    units: localStorage.getItem('weather_units') || 'metric', // 'metric' or 'imperial'
    currentCity: JSON.parse(localStorage.getItem('weather_current_city')) || {
        name: 'London',
        latitude: 51.5085,
        longitude: -0.1257,
        country: 'United Kingdom',
        countryCode: 'GB',
        timezone: 'Europe/London'
    },
    recentSearches: JSON.parse(localStorage.getItem('weather_recent_searches')) || []
};

// Weather WMO Code Interpreter
const getWeatherDetails = (code, isDay = 1) => {
    const weatherMap = {
        0: { desc: 'Clear Sky', icon: isDay ? 'sun' : 'moon', class: isDay ? 'clear' : 'night' },
        1: { desc: 'Mainly Clear', icon: isDay ? 'cloud-sun' : 'cloud-moon', class: isDay ? 'clear' : 'night' },
        2: { desc: 'Partly Cloudy', icon: isDay ? 'cloud-sun' : 'cloud-moon', class: 'cloudy' },
        3: { desc: 'Overcast', icon: 'cloud', class: 'cloudy' },
        45: { desc: 'Fog', icon: 'cloud-fog', class: 'cloudy' },
        48: { desc: 'Depositing Rime Fog', icon: 'cloud-fog', class: 'cloudy' },
        51: { desc: 'Light Drizzle', icon: 'cloud-drizzle', class: 'rainy' },
        53: { desc: 'Moderate Drizzle', icon: 'cloud-drizzle', class: 'rainy' },
        55: { desc: 'Dense Drizzle', icon: 'cloud-drizzle', class: 'rainy' },
        56: { desc: 'Light Freezing Drizzle', icon: 'cloud-snow', class: 'snowy' },
        57: { desc: 'Dense Freezing Drizzle', icon: 'cloud-snow', class: 'snowy' },
        61: { desc: 'Slight Rain', icon: 'cloud-rain', class: 'rainy' },
        63: { desc: 'Moderate Rain', icon: 'cloud-rain', class: 'rainy' },
        65: { desc: 'Heavy Rain', icon: 'cloud-rain', class: 'rainy' },
        66: { desc: 'Light Freezing Rain', icon: 'cloud-snow', class: 'snowy' },
        67: { desc: 'Heavy Freezing Rain', icon: 'cloud-snow', class: 'snowy' },
        71: { desc: 'Slight Snowfall', icon: 'snowflake', class: 'snowy' },
        73: { desc: 'Moderate Snowfall', icon: 'snowflake', class: 'snowy' },
        75: { desc: 'Heavy Snowfall', icon: 'snowflake', class: 'snowy' },
        77: { desc: 'Snow Grains', icon: 'snowflake', class: 'snowy' },
        80: { desc: 'Slight Rain Showers', icon: 'cloud-drizzle', class: 'rainy' },
        81: { desc: 'Moderate Rain Showers', icon: 'cloud-rain', class: 'rainy' },
        82: { desc: 'Violent Rain Showers', icon: 'cloud-rain', class: 'rainy' },
        85: { desc: 'Slight Snow Showers', icon: 'snowflake', class: 'snowy' },
        86: { desc: 'Heavy Snow Showers', icon: 'snowflake', class: 'snowy' },
        95: { desc: 'Thunderstorm', icon: 'cloud-lightning', class: 'stormy' },
        96: { desc: 'Thunderstorm with Hail', icon: 'cloud-lightning', class: 'stormy' },
        99: { desc: 'Thunderstorm with Heavy Hail', icon: 'cloud-lightning', class: 'stormy' }
    };
    return weatherMap[code] || { desc: 'Unknown Weather', icon: 'help-circle', class: 'clear' };
};

// Convert ISO Country Code to Emoji Flag
const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '📍';
    const codePoints = [...countryCode.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

// Debounce Helper
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

// DOM Elements
const elements = {
    search: document.getElementById('search-input'),
    dropdown: document.getElementById('search-dropdown'),
    unitMetric: document.getElementById('unit-celsius'),
    unitImperial: document.getElementById('unit-fahrenheit'),
    locateBtn: document.getElementById('btn-locate'),
    currentWeather: document.getElementById('current-weather-content'),
    metricsGrid: document.getElementById('metrics-grid-content'),
    dailyForecast: document.getElementById('daily-forecast-content'),
    recentSearches: document.getElementById('recent-searches-content'),
    chartCanvas: document.getElementById('hourly-chart')
};

let hourlyChartInstance = null;
let currentHighlightedIndex = -1;

// Init Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupSearchAutocomplete();
    setupUnitControls();
    
    // Listeners for recent searches & locate button
    elements.locateBtn.addEventListener('click', locateUser);
    
    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!elements.search.contains(e.target) && !elements.dropdown.contains(e.target)) {
            hideDropdown();
        }
    });
});

// Initialise App State
const initApp = () => {
    // Set active unit button UI
    if (state.units === 'metric') {
        elements.unitMetric.classList.add('active');
        elements.unitImperial.classList.remove('active');
    } else {
        elements.unitImperial.classList.add('active');
        elements.unitMetric.classList.remove('active');
    }
    
    // Load last search
    fetchWeatherData(state.currentCity);
    renderRecentSearches();
};

// Geolocation Fetching
const locateUser = () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    elements.locateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Reverse geocode to get a readable name
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await res.json();
                
                const locCity = {
                    name: data.city || data.locality || 'Current Location',
                    latitude: latitude,
                    longitude: longitude,
                    country: data.countryName || '',
                    countryCode: data.countryCode || '',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                };
                
                state.currentCity = locCity;
                localStorage.setItem('weather_current_city', JSON.stringify(locCity));
                saveToRecent(locCity);
                fetchWeatherData(locCity);
            } catch (err) {
                // Fallback location profile if reverse lookup fails
                const locCity = {
                    name: 'Current Location',
                    latitude: latitude,
                    longitude: longitude,
                    country: '',
                    countryCode: '',
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                };
                state.currentCity = locCity;
                localStorage.setItem('weather_current_city', JSON.stringify(locCity));
                fetchWeatherData(locCity);
            }
            elements.locateBtn.innerHTML = '<i data-lucide="map-pin"></i>';
            lucide.createIcons();
        },
        (error) => {
            alert(`Location retrieval failed: ${error.message}`);
            elements.locateBtn.innerHTML = '<i data-lucide="map-pin"></i>';
            lucide.createIcons();
        }
    );
};

// Unit Switching Support
const setupUnitControls = () => {
    elements.unitMetric.addEventListener('click', () => {
        if (state.units !== 'metric') {
            state.units = 'metric';
            localStorage.setItem('weather_units', 'metric');
            elements.unitMetric.classList.add('active');
            elements.unitImperial.classList.remove('active');
            fetchWeatherData(state.currentCity);
        }
    });

    elements.unitImperial.addEventListener('click', () => {
        if (state.units !== 'imperial') {
            state.units = 'imperial';
            localStorage.setItem('weather_units', 'imperial');
            elements.unitImperial.classList.add('active');
            elements.unitMetric.classList.remove('active');
            fetchWeatherData(state.currentCity);
        }
    });
};

// Setup Search Input Dropdown & Geocoding Autocomplete
const setupSearchAutocomplete = () => {
    const handleSearchInput = async () => {
        const query = elements.search.value.trim();
        if (query.length < 2) {
            hideDropdown();
            return;
        }

        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
                renderDropdownResults(data.results);
            } else {
                elements.dropdown.innerHTML = `<li class="p-3 text-center text-muted">No results found</li>`;
                elements.dropdown.classList.add('active');
            }
        } catch (err) {
            console.error('Geocoding query error:', err);
        }
    };

    elements.search.addEventListener('input', debounce(handleSearchInput, 300));
    elements.search.addEventListener('focus', () => {
        if (elements.search.value.trim().length >= 2) {
            elements.dropdown.classList.add('active');
        }
    });

    // Keyboard Arrow & Enter navigation in suggestions dropdown
    elements.search.addEventListener('keydown', (e) => {
        const items = elements.dropdown.querySelectorAll('.autocomplete-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentHighlightedIndex = (currentHighlightedIndex + 1) % items.length;
            highlightDropdownItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentHighlightedIndex = (currentHighlightedIndex - 1 + items.length) % items.length;
            highlightDropdownItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentHighlightedIndex >= 0 && currentHighlightedIndex < items.length) {
                items[currentHighlightedIndex].click();
            } else if (items.length > 0) {
                items[0].click();
            }
        } else if (e.key === 'Escape') {
            hideDropdown();
        }
    });
};

const highlightDropdownItem = (items) => {
    items.forEach((item, index) => {
        if (index === currentHighlightedIndex) {
            item.classList.add('highlighted');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('highlighted');
        }
    });
};

const renderDropdownResults = (results) => {
    elements.dropdown.innerHTML = '';
    currentHighlightedIndex = -1;

    results.forEach((city) => {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        
        const flag = getFlagEmoji(city.country_code);
        const regionStr = [city.admin1, city.country].filter(Boolean).join(', ');
        
        li.innerHTML = `
            <div class="autocomplete-item-details">
                <span class="autocomplete-city-name">${city.name}</span>
                <span class="autocomplete-region-name">${regionStr}</span>
            </div>
            <div class="autocomplete-country">
                <span class="country-flag">${flag}</span>
                <span class="country-name">${city.country_code || ''}</span>
            </div>
        `;

        li.addEventListener('click', () => {
            const selectedCity = {
                name: city.name,
                latitude: city.latitude,
                longitude: city.longitude,
                country: city.country || '',
                countryCode: city.country_code || '',
                timezone: city.timezone || 'auto'
            };
            
            state.currentCity = selectedCity;
            localStorage.setItem('weather_current_city', JSON.stringify(selectedCity));
            saveToRecent(selectedCity);
            fetchWeatherData(selectedCity);
            elements.search.value = '';
            hideDropdown();
        });

        elements.dropdown.appendChild(li);
    });

    elements.dropdown.classList.add('active');
};

const hideDropdown = () => {
    elements.dropdown.classList.remove('active');
    elements.dropdown.innerHTML = '';
    currentHighlightedIndex = -1;
};

// Recent Searches Management
const saveToRecent = (city) => {
    // Avoid duplicates
    state.recentSearches = state.recentSearches.filter(
        item => !(item.latitude === city.latitude && item.longitude === city.longitude)
    );
    // Unshift to add to top and cap at 5 entries
    state.recentSearches.unshift(city);
    state.recentSearches = state.recentSearches.slice(0, 5);
    localStorage.setItem('weather_recent_searches', JSON.stringify(state.recentSearches));
    renderRecentSearches();
};

const renderRecentSearches = () => {
    if (!state.recentSearches || state.recentSearches.length === 0) {
        elements.recentSearches.innerHTML = '<span class="text-muted text-center py-2" style="font-size:0.85rem">No recent searches</span>';
        return;
    }

    elements.recentSearches.innerHTML = '';
    state.recentSearches.forEach((city) => {
        const btn = document.createElement('button');
        btn.className = 'btn-icon w-auto px-3 py-2 text-nowrap';
        btn.style.borderRadius = '16px';
        btn.style.fontSize = '0.85rem';
        btn.style.gap = '6px';
        btn.innerHTML = `${getFlagEmoji(city.countryCode)} ${city.name}`;
        btn.addEventListener('click', () => {
            state.currentCity = city;
            localStorage.setItem('weather_current_city', JSON.stringify(city));
            fetchWeatherData(city);
        });
        elements.recentSearches.appendChild(btn);
    });
};

// Render Skeleton Screen Elements While Fetching
const toggleSkeletons = (show) => {
    if (show) {
        elements.currentWeather.innerHTML = `
            <div class="weather-header">
                <div class="skeleton mx-auto mb-2" style="width: 60%; height: 32px;"></div>
                <div class="skeleton mx-auto" style="width: 40%; height: 18px;"></div>
            </div>
            <div class="weather-visuals">
                <div class="skeleton mb-3" style="width: 100px; height: 100px; border-radius: 50%;"></div>
                <div class="skeleton" style="width: 120px; height: 70px;"></div>
                <div class="skeleton mt-2" style="width: 150px; height: 24px;"></div>
            </div>
            <div class="weather-meta">
                <div class="skeleton" style="width: 30%; height: 50px;"></div>
                <div class="skeleton" style="width: 30%; height: 50px;"></div>
            </div>
        `;

        elements.metricsGrid.innerHTML = Array(6).fill(0).map(() => `
            <div class="glass-panel metric-card">
                <div class="skeleton" style="width: 44px; height: 44px; border-radius: 12px;"></div>
                <div class="metric-info w-100">
                    <div class="skeleton mb-2" style="width: 50%; height: 14px;"></div>
                    <div class="skeleton" style="width: 80%; height: 20px;"></div>
                </div>
            </div>
        `).join('');

        elements.dailyForecast.innerHTML = Array(7).fill(0).map(() => `
            <div class="daily-row skeleton p-4 mb-2"></div>
        `).join('');
    }
};

// Fetch Detailed Forecast (Current, Hourly, & Daily)
const fetchWeatherData = async (city) => {
    toggleSkeletons(true);
    
    // Dynamic URL based on selected unit preferences
    const tempUnit = state.units === 'imperial' ? 'fahrenheit' : 'celsius';
    const windUnit = state.units === 'imperial' ? 'mph' : 'kmh';
    const precipUnit = state.units === 'imperial' ? 'inch' : 'mm';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}` +
                `&current_weather=true&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,uv_index,surface_pressure,visibility` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
                `&timezone=${encodeURIComponent(city.timezone)}` +
                `&temperature_unit=${tempUnit}&windspeed_unit=${windUnit}&precipitation_unit=${precipUnit}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        renderWeatherApp(data, city);
    } catch (err) {
        console.error('Error fetching weather data:', err);
        elements.currentWeather.innerHTML = `<p class="p-3 text-center">Failed to fetch weather data. Please check your connection.</p>`;
    }
};

// Assemble & Display Complete Weather Dashboard UI
const renderWeatherApp = (data, city) => {
    const current = data.current_weather;
    const hourly = data.hourly;
    const daily = data.daily;
    
    // Map temperature & speed units
    const tempSymbol = data.hourly_units.temperature_2m;
    const windSpeedSymbol = data.current_weather_units.windspeed;
    const precipSymbol = data.hourly_units.precipitation_probability ? '%' : '';
    
    // Determine day / night state
    const isDay = current.is_day;
    const weatherDetails = getWeatherDetails(current.weathercode, isDay);
    
    // Set dynamic body background classes matching current state
    document.body.className = `weather-${weatherDetails.class}`;

    // 1. Current Weather Panel Rendering
    elements.currentWeather.innerHTML = `
        <div class="weather-header">
            <h2 class="weather-location">${city.name}</h2>
            <div class="weather-country">
                <span class="country-flag">${getFlagEmoji(city.countryCode)}</span>
                <span class="country-name">${city.country || ''}</span>
            </div>
        </div>
        <div class="weather-visuals">
            <div class="weather-big-icon">
                <i data-lucide="${weatherDetails.icon}"></i>
            </div>
            <div class="weather-temp-container">
                <span class="weather-temp">${Math.round(current.temperature)}</span>
            </div>
            <p class="weather-desc">${weatherDetails.desc}</p>
        </div>
        <div class="weather-meta">
            <div class="meta-item">
                <span class="meta-label">High</span>
                <span class="meta-value">${Math.round(daily.temperature_2m_max[0])}${tempSymbol}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Low</span>
                <span class="meta-value">${Math.round(daily.temperature_2m_min[0])}${tempSymbol}</span>
            </div>
        </div>
    `;

    // Calculate dynamic values for grid index
    // Let's find index in hourly values that represents current hour
    const currentTimeStr = current.time;
    const currentHourIndex = hourly.time.findIndex(t => t.startsWith(currentTimeStr.substring(0, 13))) || 0;
    
    const currentHumidity = hourly.relative_humidity_2m[currentHourIndex] || 0;
    const currentFeelsLike = hourly.apparent_temperature[currentHourIndex] || current.temperature;
    const currentUV = daily.uv_index_max[0] || 0;
    const currentPressure = hourly.surface_pressure[currentHourIndex] || 0;
    const currentVisibility = hourly.visibility[currentHourIndex] || 0;
    
    // Convert visibility metrics for readable cards
    const visVal = state.units === 'metric' ? `${(currentVisibility / 1000).toFixed(1)} km` : `${(currentVisibility * 0.000621371).toFixed(1)} mi`;
    
    // Sunrise/sunset formatter
    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // 2. Info Cards Grid Layout
    elements.metricsGrid.innerHTML = `
        <div class="glass-panel metric-card">
            <div class="metric-icon"><i data-lucide="thermometer"></i></div>
            <div class="metric-info">
                <span class="metric-name">Feels Like</span>
                <span class="metric-val">${Math.round(currentFeelsLike)}${tempSymbol}</span>
            </div>
        </div>
        <div class="glass-panel metric-card">
            <div class="metric-icon"><i data-lucide="wind"></i></div>
            <div class="metric-info">
                <span class="metric-name">Wind Speed</span>
                <span class="metric-val">${current.windspeed} ${windSpeedSymbol}</span>
            </div>
        </div>
        <div class="glass-panel metric-card">
            <div class="metric-icon"><i data-lucide="droplets"></i></div>
            <div class="metric-info">
                <span class="metric-name">Humidity</span>
                <span class="metric-val">${currentHumidity}%</span>
            </div>
        </div>
        <div class="glass-panel metric-card">
            <div class="metric-icon"><i data-lucide="sun"></i></div>
            <div class="metric-info">
                <span class="metric-name">UV Index</span>
                <span class="metric-val">${currentUV.toFixed(1)}</span>
            </div>
        </div>
        <div class="glass-panel metric-card">
            <div class="metric-icon"><i data-lucide="eye"></i></div>
            <div class="metric-info">
                <span class="metric-name">Visibility</span>
                <span class="metric-val">${visVal}</span>
            </div>
        </div>
        <div class="glass-panel metric-card">
            <div class="metric-icon"><i data-lucide="gauge"></i></div>
            <div class="metric-info">
                <span class="metric-name">Pressure</span>
                <span class="metric-val">${Math.round(currentPressure)} hPa</span>
            </div>
        </div>
        <div class="glass-panel metric-card justify-content-center" style="grid-column: span 2;">
            <div class="d-flex align-items-center gap-4">
                <div class="d-flex align-items-center gap-2">
                    <div class="metric-icon text-warning"><i data-lucide="sunrise"></i></div>
                    <div class="metric-info">
                        <span class="metric-name">Sunrise</span>
                        <span class="metric-val" style="font-size:0.95rem">${formatTime(daily.sunrise[0])}</span>
                    </div>
                </div>
                <div class="border-end h-100" style="width: 1px; min-height: 40px; border-color: rgba(255,255,255,0.1) !important;"></div>
                <div class="d-flex align-items-center gap-2">
                    <div class="metric-icon text-warning"><i data-lucide="sunset"></i></div>
                    <div class="metric-info">
                        <span class="metric-name">Sunset</span>
                        <span class="metric-val" style="font-size:0.95rem">${formatTime(daily.sunset[0])}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 3. 7-Day Forecast Section Layout
    elements.dailyForecast.innerHTML = '';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayLabel = i === 0 ? 'Today' : dayNames[date.getDay()];
        const forecastDetails = getWeatherDetails(daily.weather_code[i], 1);
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const rainProb = daily.precipitation_probability_max[i] || 0;

        const row = document.createElement('div');
        row.className = 'daily-row';
        row.innerHTML = `
            <span class="daily-day">${dayLabel}</span>
            <span class="daily-icon" title="${forecastDetails.desc}"><i data-lucide="${forecastDetails.icon}"></i></span>
            <span class="daily-rain-prob">${rainProb > 0 ? rainProb + '%' : ''}</span>
            <div class="daily-temp-range">
                <span class="temp-max">${maxTemp}°</span>
                <span class="temp-min">${minTemp}°</span>
            </div>
        `;
        elements.dailyForecast.appendChild(row);
    }

    // 4. Draw/Redraw Chart.js Hourly Graph
    renderHourlyChart(data);

    // Initialise newly dynamically created Lucide icon SVG tags
    lucide.createIcons();
};

// Chart.js Drawing Handler for 24-hour Trend
const renderHourlyChart = (data) => {
    const hourly = data.hourly;
    const timeLabels = [];
    const temperatures = [];
    const rainProbabilities = [];
    
    // Get current index relative to hourly forecast arrays
    const currentHourIndex = hourly.time.findIndex(t => {
        const d = new Date();
        const hourStr = d.toISOString().substring(0, 13); // "YYYY-MM-DDTHH"
        return t.startsWith(hourStr);
    }) || 0;
    
    // Take 24 hourly intervals starting from the current hour
    const startIdx = Math.max(0, currentHourIndex);
    const endIdx = startIdx + 24;

    for (let i = startIdx; i < Math.min(endIdx, hourly.time.length); i++) {
        const date = new Date(hourly.time[i]);
        const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        timeLabels.push(label);
        temperatures.push(hourly.temperature_2m[i]);
        rainProbabilities.push(hourly.precipitation_probability[i] || 0);
    }

    // Clear old chart to redraw properly
    if (hourlyChartInstance) {
        hourlyChartInstance.destroy();
    }

    const ctx = elements.chartCanvas.getContext('2d');
    
    // Build gradients
    const tempGradient = ctx.createLinearGradient(0, 0, 0, 200);
    tempGradient.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    tempGradient.addColorStop(1, 'rgba(56, 189, 248, 0.02)');

    const rainGradient = ctx.createLinearGradient(0, 0, 0, 200);
    rainGradient.addColorStop(0, 'rgba(96, 165, 250, 0.2)');
    rainGradient.addColorStop(1, 'rgba(96, 165, 250, 0)');

    const tempSymbol = data.hourly_units.temperature_2m;

    hourlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                {
                    label: `Temperature (${tempSymbol})`,
                    data: temperatures,
                    borderColor: '#38bdf8',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#38bdf8',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#38bdf8',
                    pointRadius: 2,
                    pointHoverRadius: 5,
                    fill: true,
                    backgroundColor: tempGradient,
                    yAxisID: 'y'
                },
                {
                    label: 'Precipitation %',
                    data: rainProbabilities,
                    borderColor: 'rgba(96, 165, 250, 0.6)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    pointHoverRadius: 3,
                    fill: true,
                    backgroundColor: rainGradient,
                    yAxisID: 'y1',
                    borderDash: [4, 4]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.75)',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        },
                        boxWidth: 12
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    titleFont: {
                        family: 'Outfit'
                    },
                    bodyFont: {
                        family: 'Plus Jakarta Sans'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        tickColor: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxTicksLimit: 8,
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 10
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback: function(value) {
                            return value + '°';
                        },
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 10
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false // prevent grid gridlines layering over temperature
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        color: 'rgba(96, 165, 250, 0.65)',
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 10
                        }
                    }
                }
            }
        }
    });
};
