import React, { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Inputs from "./Inputs";
import TimeAndLocation from "./TimeAndLocation";
import TemperatureAndDetails from "./TemperatureAndDetails";
import Forecast from "./Forecast";
import getFormattedWeatherData from "./weatherService";
import "./styles.css"; // Import a CSS file for custom styles

function FavCities() {
  const [query, setQuery] = useState({ q: "bangalore" }); // Default city set to "Bangalore"
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);
  const isInitialRender = useRef(true); // Track initial render

  useEffect(() => {
    // Fetch weather only if a valid query is provided and not during the initial render
    if (!isInitialRender.current && query.q !== "") {
      const fetchWeather = async () => {
        const message = query.q ? query.q : "current location.";

        toast.info("Fetching weather for " + message);

        try {
          const data = await getFormattedWeatherData({ ...query, units });

          if (data) {
            toast.success(
              `Successfully fetched weather for ${data.name}, ${data.country}.`
            );
            setWeather(data);
          } else {
            toast.error("Error fetching weather data. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
          toast.error("Error fetching weather data. Please try again.");
        }
      };

      fetchWeather();
    }

    // Update the ref to indicate that the initial render has occurred
    isInitialRender.current = false;
  }, [query, units]);

  return (
    <div className="app-container">
      <Inputs setQuery={setQuery} units={units} setUnits={setUnits} />

      {weather && (
        <div>
          <TimeAndLocation weather={weather} />
          <TemperatureAndDetails weather={weather} />

          <div className="forecast-container">
            <Forecast title="Hourly Forecast" items={weather.hourly} />
          </div>

          <Forecast title="Daily Forecast" items={weather.daily} />
        </div>
      )}

      <ToastContainer autoClose={1000} theme="colored" newestOnTop={true} />
    </div>
  );
}

export default FavCities;
