const apiKey = "YOUR_API_KEY";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const todayWeather = document.getElementById("todayWeather");
const forecastDiv = document.getElementById("forecast");
const errorBox = document.getElementById("errorBox");
const recentDropdown = document.getElementById("recentCities");
const unitToggle = document.getElementById("unitToggle");
const body = document.getElementById("body");

let currentUnit = "metric";
let currentTemp = 0;

// SEARCH BY CITY
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city === "") {
        showError("Please enter a city name.");
        return;
    }
    getWeatherByCity(city);
});

// GEOLOCATION
locationBtn.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(position => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
    }, () => {
        showError("Location access denied.");
    });
});

// TOGGLE
unitToggle.addEventListener("click", () => {
    if (currentUnit === "metric") {
        currentUnit = "imperial";
        unitToggle.innerText = "°C";
    } else {
        currentUnit = "metric";
        unitToggle.innerText = "°F";
    }
    displayTemp(currentTemp);
});

// FETCH CITY WEATHER
async function getWeatherByCity(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${currentUnit}&appid=${apiKey}`
        );

        if (!res.ok) throw new Error("City not found.");

        const data = await res.json();
        currentTemp = data.main.temp;
        displayToday(data);
        saveRecent(city);
        getForecast(city);
    } catch (error) {
        showError(error.message);
    }
}

// FORECAST
async function getForecast(city) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${currentUnit}&appid=${apiKey}`
    );
    const data = await res.json();

    forecastDiv.innerHTML = "";

    const filtered = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    filtered.slice(0,5).forEach(day => {
        forecastDiv.innerHTML += `
        <div class="glass p-4 text-white rounded text-center">
            <p>${new Date(day.dt_txt).toDateString()}</p>
            <p>🌡 ${day.main.temp}°</p>
            <p>💨 ${day.wind.speed} m/s</p>
            <p>💧 ${day.main.humidity}%</p>
        </div>`;
    });
}

// DISPLAY TODAY
function displayToday(data) {
    todayWeather.innerHTML = `
        <h2 class="text-2xl font-bold">${data.name}</h2>
        <p class="text-xl mt-2">${data.weather[0].description}</p>
        <p id="tempDisplay" class="text-4xl font-bold mt-3">${data.main.temp}°</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} m/s</p>
    `;

    displayTemp(data.main.temp);
    changeBackground(data.weather[0].main, data.main.temp);
}

// UNIT DISPLAY
function displayTemp(temp) {
    document.getElementById("tempDisplay").innerText =
        temp + (currentUnit === "metric" ? "°C" : "°F");

    if (temp > 40 && currentUnit === "metric") {
        showError("Extreme Heat Alert! Stay hydrated.");
    }
}

// BACKGROUND CHANGE
function changeBackground(condition, temp) {
    body.className = "min-h-screen transition-all duration-700";

    if (condition.includes("Rain")) {
        body.classList.add("rainy");
    } else if (temp < 10) {
        body.classList.add("cold");
    } else {
        body.classList.add("sunny");
    }
}

// ERROR UI
function showError(message) {
    errorBox.innerText = message;
    errorBox.classList.remove("hidden");
    setTimeout(() => errorBox.classList.add("hidden"), 3000);
}

// LOCAL STORAGE
function saveRecent(city) {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];

    if (!cities.includes(city)) {
        cities.push(city);
        localStorage.setItem("cities", JSON.stringify(cities));
    }

    loadRecent();
}

function loadRecent() {
    let cities = JSON.parse(localStorage.getItem("cities")) || [];
    if (cities.length > 0) {
        recentDropdown.classList.remove("hidden");
        recentDropdown.innerHTML = "<option>Select Recent</option>";
        cities.forEach(city => {
            recentDropdown.innerHTML += `<option>${city}</option>`;
        });
    }
}

recentDropdown.addEventListener("change", () => {
    getWeatherByCity(recentDropdown.value);
});

loadRecent();