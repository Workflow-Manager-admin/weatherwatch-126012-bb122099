import React, { useState, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * MainContainer for WeatherWatch App
 * 
 * Displays current weather conditions, forecasts, and weather alerts
 * for a user-selected or geolocated city.
 * Fetches real-time weather data from a public API.
 */
function MainContainer() {
  // State management
  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Constants for API (using OpenWeatherMap for demo; replace API_KEY for production)
  const API_KEY = "demo"; // Use a real key for actual deployment
  const BASE_URL = "https://api.openweathermap.org/data/2.5";

  // Fetch weather by coordinates or city
  useEffect(() => {
    if ((!coords && !city) || loading) return;
    setLoading(true);
    setError(null);

    // Determine which fetch to use
    let url = "";
    if (coords) {
      url = `${BASE_URL}/weather?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&appid=${API_KEY}`;
    } else if (city) {
      url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    }

    // Fetch current weather
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error("City not found or API error.");
        return r.json();
      })
      .then(data => {
        setWeather(data);
        setCity(data.name); // Normalize city name
        // Fetch forecast and (optionally) alerts next
        return Promise.all([
          fetch(`${BASE_URL}/forecast?lat=${data.coord.lat}&lon=${data.coord.lon}&units=metric&appid=${API_KEY}`).then(r => r.json()),
          fetch(`${BASE_URL}/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,daily&appid=${API_KEY}`)
            .then(r => r.ok ? r.json() : Promise.resolve({ alerts: [] }))
            .catch(() => ({ alerts: [] }))
        ]);
      })
      .then(([forecastData, onecallData]) => {
        setForecast(forecastData);
        setAlerts(onecallData.alerts || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [coords, city]);

  // Attempt geolocation on mount
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      position => setCoords(position.coords),
      () => {} // Silently ignore if blocked
    );
  }, []);

  // Handlers
  const handleInputChange = e => setSearchInput(e.target.value);

  const handleSearchSubmit = e => {
    e.preventDefault();
    setCoords(null);
    setCity(searchInput.trim());
  };

  return (
    <div className="weatherwatch-container" style={{ paddingTop: 100, minHeight: "90vh" }}>
      <form onSubmit={handleSearchSubmit} className="weather-search" style={{ marginBottom: 24, display: "flex", justifyContent: "center", gap: 8 }}>
        <input
          type="text"
          placeholder="Enter city name"
          value={searchInput}
          onChange={handleInputChange}
          className="weather-search-input"
          style={{
            padding: "8px 12px",
            fontSize: "1.05rem",
            border: "1px solid var(--border-color, #ccc)",
            borderRadius: 4,
            minWidth: 230
          }}
        />
        <button className="btn" type="submit">Search</button>
      </form>

      {loading && <div style={{ textAlign: "center" }}>Loading...</div>}
      {error && <div style={{ color: "salmon", textAlign: "center" }}>{error}</div>}

      {/* Current Weather */}
      {weather && (
        <section style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ marginBottom: 6 }}>{weather.name}, {weather.sys?.country}</h2>
          <div style={{ fontSize: "3rem", fontWeight: 500 }}>
            {Math.round(weather.main.temp)}°C
          </div>
          <div style={{ fontSize: "1.2rem", color: "var(--text-secondary, #999)", margin: "8px 0" }}>
            {weather.weather[0]?.description}
          </div>
          <img
            alt={weather.weather[0]?.main}
            src={`https://openweathermap.org/img/wn/${weather.weather[0]?.icon}@2x.png`}
            style={{ verticalAlign: "middle" }}
          />
          <div style={{ marginTop: 8 }}>
            Feels like {Math.round(weather.main.feels_like)}°C | Humidity: {weather.main.humidity}% | Wind: {weather.wind.speed} m/s
          </div>
        </section>
      )}

      {/* Forecast */}
      {forecast?.list && (
        <section style={{ marginBottom: 36 }}>
          <h3 style={{ marginBottom: 12 }}>5-Day Forecast</h3>
          <div style={{ display: "flex", gap: 18, overflowX: "auto" }}>
            {forecast.list
              .filter((f, idx, arr) =>
                // Approximately midday (12:00:00) for each day and unique dates only
                f.dt_txt.includes("12:00:00") &&
                idx === arr.findIndex(item => item.dt_txt.split(" ")[0] === f.dt_txt.split(" ")[0])
              )
              .slice(0, 5)
              .map(f => (
                <div
                  key={f.dt}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-color, #ccc)",
                    borderRadius: 8,
                    padding: 14,
                    minWidth: 100,
                    textAlign: "center"
                  }}
                >
                  <div style={{ marginBottom: 6, fontWeight: 500 }}>
                    {new Date(f.dt_txt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${f.weather[0].icon}.png`}
                    alt={f.weather[0].description}
                  />
                  <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{Math.round(f.main.temp)}°C</div>
                  <div style={{ fontSize: ".97rem", color: "var(--text-secondary, #aaa)" }}>
                    {f.weather[0].main}
                  </div>
                </div>
              ))
            }
          </div>
        </section>
      )}

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h3 style={{ color: "var(--kavia-orange, orange)", marginBottom: 10 }}>Weather Alert{alerts.length > 1 ? 's' : ''}</h3>
          <ul style={{ padding: 0, listStyle: "none" }}>
            {alerts.map((alert, idx) => (
              <li
                key={idx}
                style={{
                  background: "rgba(232,122,65,0.08)",
                  borderLeft: "4px solid var(--kavia-orange, orange)",
                  padding: "10px 16px",
                  marginBottom: 14,
                  borderRadius: 4
                }}
              >
                <strong>{alert.event}</strong>
                {alert.sender_name && <span style={{ marginLeft: 8, fontSize: "smaller", color: "#FF8B4D" }}>from {alert.sender_name}</span>}
                <div style={{ fontSize: ".99rem" }}>{alert.description}</div>
                {alert.start && (
                  <div style={{ fontSize: ".88rem", color: "var(--text-secondary)" }}>
                    {`From: ${new Date(alert.start * 1000).toLocaleString()} To: ${new Date(alert.end * 1000).toLocaleString()}`}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && !weather && (
        <div style={{ textAlign: "center", color: "var(--text-secondary, #bbb)", marginTop: 20 }}>
          Please enter a city name or allow location access to see the weather.
        </div>
      )}
    </div>
  );
}

export default MainContainer;
