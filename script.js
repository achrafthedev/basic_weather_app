const getWeather = async () => {
    const city = document.getElementById('city').value;

    // Geocoding API to convert city name to latitude and longitude
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;

    try {
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude, name } = geoData.results[0];

            // Weather API to get weather data based on latitude and longitude
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();

            const weather = weatherData.current_weather;

            // Display the weather data
            document.getElementById('weatherResult').innerHTML = `
                <h2>Weather in ${name}</h2>
                <p>Temperature: ${weather.temperature}°C</p>
                <p>Wind Speed: ${weather.windspeed} km/h</p>
                <p>Condition: ${weather.weathercode}</p>
            `;
        } else {
            document.getElementById('weatherResult').innerHTML = `<p>City not found!</p>`;
        }
    } catch (error) {
        document.getElementById('weatherResult').innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    }
};

document.getElementById('getWeather').addEventListener('click', getWeather);
