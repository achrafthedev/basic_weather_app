const apiKey = 'YOUR_API_KEY';

const getWeather = async () => {
    const city = document.getElementById('city').value;
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (data.cod === 200) {
            document.getElementById('weatherResult').innerHTML = `
                <h2>Weather in ${data.name}</h2>
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Condition: ${data.weather[0].description}</p>
            `;
        } else {
            document.getElementById('weatherResult').innerHTML = `<p>${data.message}</p>`;
        }
    } catch (error) {
        document.getElementById('weatherResult').innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    }
};


document.getElementById('getWeather').addEventListener('click', getWeather);