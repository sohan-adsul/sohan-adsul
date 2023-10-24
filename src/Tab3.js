import React, { useState, useRef, useEffect } from "react";
import debounce from "lodash.debounce";
import "./styles.css";

const Tab3 = () => {
  const [favouriteCities, setFavouriteCities] = useState(
    JSON.parse(localStorage.getItem("favouriteCities")) || []
  );
  const [cityWeatherData, setCityWeatherData] = useState(
    JSON.parse(localStorage.getItem("cityWeatherData")) || {
      rain: {}, // Initialize rain data as an empty object
    }
  );
  const [newCity, setNewCity] = useState("");

  const handleChange = (event) => {
    setNewCity(event.target.value);
  };

  const handleSubmit = async () => {
    if (newCity.trim() === "") {
      return; // Prevent adding empty city names
    }

    if (!favouriteCities.includes(newCity)) {
      // Check if the city is not already in the list
      const updatedCities = [...favouriteCities, newCity];
      setFavouriteCities(updatedCities);

      // Update the local storage
      localStorage.setItem("favouriteCities", JSON.stringify(updatedCities));

      alert("Submitted");
      fetchWeatherData([newCity]);
      setNewCity("");
    }
  };

  const inputRef = useRef();

  useEffect(() => {
    fetchFavoriteCitiesFromServer();
  }, []);

  const debouncedHandleChange = debounce(handleChange, 500);

  const fetchFavoriteCitiesFromServer = async () => {
    try {
      const response = await fetch("/api/favorite-cities");
      if (response.ok) {
        const cities = await response.json();
        setFavouriteCities(cities);

        // Update the local storage
        localStorage.setItem("favouriteCities", JSON.stringify(cities));
      } else {
        console.error("Failed to fetch favorite cities from the server");
      }
    } catch (error) {
      console.error("Error fetching favorite cities:", error);
    }
  };

  const fetchWeatherData = (cities) => {
    const API_KEY = "e2a0c5bd1a80477c75716e695b7077c5";
    const weatherData = { ...cityWeatherData };

    cities.forEach(async (city) => {
      const localStorageData = localStorage.getItem(`cityWeatherData_${city}`);
      if (localStorageData) {
        weatherData[city] = JSON.parse(localStorageData);
        setCityWeatherData(weatherData);
      } else {
        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
          );

          if (response.ok) {
            const data = await response.json();
            const cityData = {
              temp: data.main.temp,
              humidity: data.main.humidity,
              pressure: data.main.pressure,
              weathermood: data.weather[0].description,
              name: data.name,
              speed: data.wind.speed,
              country: data.sys.country,
              sunset: data.sys.sunset,
              rain: data.rain ? data.rain["1h"] || 0 : 0, // Add rain data (1-hour)
            };

            weatherData[city] = cityData;
            localStorage.setItem(
              `cityWeatherData_${city}`,
              JSON.stringify(cityData)
            );

            setCityWeatherData(weatherData);
          } else {
            console.error("Error fetching weather data for " + city);
          }
        } catch (error) {
          console.error("Error fetching weather data: " + error);
        }
      }
    });
  };

  useEffect(() => {
    fetchWeatherData(favouriteCities);

    const intervalId = setInterval(() => {
      fetchWeatherData(favouriteCities);
    }, 600000);

    return () => clearInterval(intervalId);
  }, [favouriteCities]);

  // Function to handle city removal
  const handleRemove = (city) => {
    const updatedCities = favouriteCities.filter((c) => c !== city);
    setFavouriteCities(updatedCities);

    // Remove the city's weather data from cityWeatherData and localStorage
    const updatedWeatherData = { ...cityWeatherData };
    delete updatedWeatherData[city];
    setCityWeatherData(updatedWeatherData);
    localStorage.removeItem(`cityWeatherData_${city}`);

    // Update the local storage
    localStorage.setItem("favouriteCities", JSON.stringify(updatedCities));
  };

  return (
    <>
      <div className="favourites">
        <h2>My Favourite Locations</h2>
        <input
          className="input-city"
          type="text"
          placeholder="Enter your favourite cities..."
          ref={inputRef}
          value={newCity}
          onChange={handleChange}
        />
        <button className="add" onClick={handleSubmit}>
          Add
        </button>
      </div>
      <div className="weather-table-container">
        <div className="weather-table">
          <table>
            <thead>
              <tr>
                <th>City</th>
                <th>Temperature (°C)</th>
                <th>Humidity (%)</th>
                <th>Pressure (hPa)</th>
                <th>Mood</th>
                <th>Wind Speed (m/s)</th>
                <th>Rain (mm)</th> {/* Add this line */}
                <th>Country</th>
                <th>Sunset Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {favouriteCities.map((city) => (
                <tr key={city}>
                  <td>{city}</td>
                  <td>
                    {cityWeatherData[city]?.temp.toFixed(4) / 10 || "N/A"}
                  </td>
                  <td>{cityWeatherData[city]?.humidity || "N/A"}</td>
                  <td>{cityWeatherData[city]?.pressure || "N/A"}</td>
                  <td>{cityWeatherData[city]?.weathermood || "N/A"}</td>
                  <td>{cityWeatherData[city]?.speed || "N/A"}</td>
                  <td>{cityWeatherData[city]?.rain || "N/A"}</td>{" "}
                  {/* Add this line */}
                  <td>{cityWeatherData[city]?.country || "N/A"}</td>
                  <td>
                    {cityWeatherData[city]?.sunset
                      ? new Date(
                          cityWeatherData[city]?.sunset * 1000
                        ).toLocaleTimeString()
                      : "N/A"}
                  </td>
                  <td>
                    <button id="remove" onClick={() => handleRemove(city)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Tab3;
