const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherInfo = document.getElementById("weatherInfo");
const loadingBox = document.getElementById("loadingBox");
const errorBox = document.getElementById("errorBox");
const errorMsg = document.getElementById("errorMsg");
 
// Open-Meteo weather codes -> condition text + icon
// Docs: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const weatherCodeMap = {
    0: { text: "Clear sky", icon: "fa-sun" },
    1: { text: "Mainly clear", icon: "fa-sun" },
    2: { text: "Partly cloudy", icon: "fa-cloud-sun" },
    3: { text: "Overcast", icon: "fa-cloud" },
    45: { text: "Fog", icon: "fa-smog" },
    48: { text: "Depositing rime fog", icon: "fa-smog" },
    51: { text: "Light drizzle", icon: "fa-cloud-rain" },
    53: { text: "Moderate drizzle", icon: "fa-cloud-rain" },
    55: { text: "Dense drizzle", icon: "fa-cloud-rain" },
    61: { text: "Slight rain", icon: "fa-cloud-showers-heavy" },
    63: { text: "Moderate rain", icon: "fa-cloud-showers-heavy" },
    65: { text: "Heavy rain", icon: "fa-cloud-showers-heavy" },
    71: { text: "Slight snow fall", icon: "fa-snowflake" },
    73: { text: "Moderate snow fall", icon: "fa-snowflake" },
    75: { text: "Heavy snow fall", icon: "fa-snowflake" },
    80: { text: "Slight rain showers", icon: "fa-cloud-showers-heavy" },
    81: { text: "Moderate rain showers", icon: "fa-cloud-showers-heavy" },
    82: { text: "Violent rain showers", icon: "fa-cloud-showers-heavy" },
    95: { text: "Thunderstorm", icon: "fa-bolt" },
    96: { text: "Thunderstorm with hail", icon: "fa-bolt" },
    99: { text: "Thunderstorm with heavy hail", icon: "fa-bolt" },
};
 
function showLoading() {
    loadingBox.classList.remove("d-none");
    errorBox.classList.add("d-none");
    weatherInfo.classList.add("d-none");
}
 
function showError(message) {
    loadingBox.classList.add("d-none");
    errorBox.classList.remove("d-none");
    weatherInfo.classList.add("d-none");
    errorMsg.textContent = message;
}
 
function showWeather() {
    loadingBox.classList.add("d-none");
    errorBox.classList.add("d-none");
    weatherInfo.classList.remove("d-none");
}
 
async function getCoordinates(city) {
    // Free geocoding API - no key needed
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
 
    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please check the spelling and try again.");
    }
 
    const place = data.results[0];
    return {
        lat: place.latitude,
        lon: place.longitude,
        name: place.name,
        country: place.country || "",
    };
}
 
async function getWeather(lat, lon) {
    // Free forecast API - no key needed
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const res = await fetch(url);
 
    if (!res.ok) {
        throw new Error("Weather service is unavailable right now. Please try again later.");
    }
 
    const data = await res.json();
    return data.current;
}
 
async function searchWeather() {
    const city = cityInput.value.trim();
 
    if (city === "") {
        alert("Please enter a city name");
        return;
    }
 
    showLoading();
 
    try {
        const location = await getCoordinates(city);
        const current = await getWeather(location.lat, location.lon);
 
        const code = current.weather_code;
        const conditionInfo = weatherCodeMap[code] || { text: "Unknown", icon: "fa-cloud" };
 
        document.getElementById("cityName").textContent =
            location.country ? `${location.name}, ${location.country}` : location.name;
        document.getElementById("temperature").textContent = `${Math.round(current.temperature_2m)}°C`;
        document.getElementById("condition").textContent = conditionInfo.text;
        document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
        document.getElementById("wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
 
        const iconEl = document.getElementById("weatherIcon");
        iconEl.className = `fa-solid ${conditionInfo.icon} weather-icon`;
 
        showWeather();
    } catch (err) {
        showError(err.message || "Something went wrong. Please try again.");
    }
}
 
searchBtn.addEventListener("click", searchWeather);
 
// Also allow pressing Enter in the input field
cityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchWeather();
    }
});
 
