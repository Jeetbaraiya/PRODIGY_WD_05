const weatherInfo = document.getElementById("weatherInfo");

async function getLatLonForCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("City not found");
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error("City not found");
  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country
  };
}

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city name.");
  weatherInfo.innerHTML = "Loading...";
  getLatLonForCity(city)
    .then(({ latitude, longitude, name, country }) => {
      fetchWeather(latitude, longitude, name, country);
    })
    .catch(err => {
      weatherInfo.innerHTML = `<p style=\"color:red;\">Error: ${err.message}</p>`;
    });
}

function getWeatherByLocation() {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported.");
  }
  weatherInfo.innerHTML = "Loading...";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeather(latitude, longitude, "Your Location", "");
    },
    () => {
      weatherInfo.innerHTML = `<p style=\"color:red;\">Location access denied or unavailable.</p>`;
    }
  );
}

function fetchWeather(latitude, longitude, cityName, country) {
  // Only fetch current weather
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Weather data not found.");
      return res.json();
    })
    .then(data => showWeather(data, cityName, country))
    .catch(err => {
      weatherInfo.innerHTML = `<p style=\"color:red;\">Error: ${err.message}</p>`;
    });
}

function showWeather(data, cityName, country) {
  if (!data.current_weather) {
    weatherInfo.innerHTML = `<p style=\"color:red;\">No weather data available.</p>`;
    return;
  }
  const w = data.current_weather;
  weatherInfo.innerHTML = `
    <h2>${cityName}${country ? ", " + country : ""}</h2>
    <p><strong>Weather Code:</strong> ${w.weathercode}</p>
    <p>🌡️ Temperature: ${w.temperature} °C</p>
    <p>💨 Wind Speed: ${w.windspeed} km/h</p>
    <p>🧭 Wind Direction: ${w.winddirection}°</p>
    <p>${w.is_day ? "☀️ Day" : "🌙 Night"}</p>
  `;
}
