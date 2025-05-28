import React from 'react';
import './App.css';
import MainContainer from "./MainContainer";

// PUBLIC_INTERFACE
/**
 * App component wraps the main layout and header for WeatherWatch,
 * displaying the MainContainer for weather data.
 */
function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> WeatherWatch
            </div>
            <span className="subtitle" style={{ color: "var(--kavia-orange)" }}>
              Your simple, modern weather app
            </span>
          </div>
        </div>
      </nav>

      <main>
        <div className="container">
          <MainContainer />
        </div>
      </main>
    </div>
  );
}

export default App;
