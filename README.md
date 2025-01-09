
# 🌦️ Weather App

This is a **simple weather app** that allows users to get real-time weather information for any city. The app uses the **Open-Meteo API** to fetch weather data based on the city’s latitude and longitude. It features a clean UI built with **Bootstrap 5**.

---

## 🚀 Features
- Search for any city to get current weather data.
- Displays temperature, wind speed, and weather conditions.
- Responsive design using **Bootstrap 5**.
- Uses **Open-Meteo API**, which is free and does not require an API key.

---

## 🛠️ Technologies Used
- **HTML5**
- **CSS3**
- **JavaScript (ES6)**
- **Bootstrap 5**
- **Open-Meteo API**

---

## 📋 How to Run the Project

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/achrafthedev/basic_weather_app.git
```

### 2️⃣ Navigate to the Project Directory
```bash
cd basic_weather_app
```

### 3️⃣ Open the `index.html` File
You can simply open the `index.html` file in your browser to run the app.

---

## 🌐 API Details

### **Geocoding API** (to get latitude and longitude):
`https://geocoding-api.open-meteo.com/v1/search?name={city}`

### **Weather API** (to get weather data):
`https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true`

---

## 📂 Project Structure
```
weather-app/
├── index.html
├── style.css
├── script.js
```

- **index.html**: The main HTML file containing the structure of the app.
- **style.css**: Custom CSS file for additional styling.
- **script.js**: JavaScript file containing the logic to fetch and display weather data.

---


## ⚙️ How It Works
1. The user enters a city name in the input field.
2. The app sends a request to the **Geocoding API** to get the latitude and longitude of the city.
3. Using the latitude and longitude, the app sends a request to the **Weather API** to get the current weather data.
4. The weather information is displayed on the screen.

---

## 🎨 UI Enhancements
- **Bootstrap 5** is used to create a responsive and clean UI.
- The input field and button are styled to ensure a smooth user experience.

---

## 🤖 Future Improvements
- Add more weather details (e.g., humidity, sunrise/sunset times).
- Include a 5-day weather forecast.
- Add a loading spinner while fetching data.

---

## 📄 License
This project is licensed under the **MIT License**. You are free to use, modify, and distribute this project as you wish.

---

## 🤝 Contributing
Contributions are welcome! If you want to improve this project, feel free to submit a pull request.

---

## 📧 Contact
For any inquiries or feedback, please contact me at:
- **Email**: achrafthedev@gmail.com
- **GitHub**: [https://github.com/achrafthedev](https://github.com/achrafthedev)

---

### 🌟 **If you like this project, please give it a star on GitHub!** 🌟
