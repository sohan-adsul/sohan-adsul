import React, { useState, useEffect, useMemo } from "react";
import "./styles.css";

// Your OpenWeatherAPI key
const API_KEY = "e2a0c5bd1a80477c75716e695b7077c5";

const FavCities = () => {
  // Load the weatherData from localStorage on initial render
  const [autocompleteData, setAutocompleteData] = useState([]);
  const fetchCitySuggestions = (input) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/find?q=${input}&appid=${API_KEY}`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.list) {
          const suggestions = data.list.map((item) => item.name);
          setAutocompleteData(suggestions);
        }
      })
      .catch((error) => {
        console.error("Error fetching city suggestions:", error);
      });
  };
  const [weatherData, setWeatherData] = useState(
    JSON.parse(localStorage.getItem("weatherData")) || {}
  );
  const [isSearching, setIsSearching] = useState(false);
  const [popupCity, setPopupCity] = useState("");
  const [sortBy, setSortBy] = useState(""); // To store sorting criteria
  const [currentLocation, setCurrentLocation] = useState(null);
  const [errorFetchingCity, setErrorFetchingCity] = useState(false); // Add error state
  const [showAddCityPopup, setShowAddCityPopup] = useState(false); // Control whether to show the add city popup
  const [sortOrder, setSortOrder] = useState("asc"); // Ascending or descending sort

  useEffect(() => {
    // Fetch current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      });
    }
  }, []);

  useEffect(() => {
    // Fetch live rain data for favorite cities at regular intervals (e.g., every 15 minutes)
    const interval = setInterval(() => {
      fetchLiveRainData();
    }, 15 * 60 * 1000); // 15 minutes in milliseconds

    // Initial fetch for live rain data
    fetchLiveRainData();

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []);

  const sortCities = useMemo(() => {
    return (cities, criteria) => {
      return [...cities].sort((a, b) => {
        const valueA = parseFloat(weatherData[a]?.[criteria]);
        const valueB = parseFloat(weatherData[b]?.[criteria]);

        console.log(`City A: ${a}, Temperature A: ${valueA}`);
        console.log(`City B: ${b}, Temperature B: ${valueB}`);

        if (criteria === "distance" && currentLocation) {
          const distanceA = calculateDistance(
            currentLocation?.lat || 0,
            currentLocation?.lon || 0,
            weatherData[a]?.lat || 0,
            weatherData[a]?.lon || 0
          );
          const distanceB = calculateDistance(
            currentLocation?.lat || 0,
            currentLocation?.lon || 0,
            weatherData[b]?.lat || 0,
            weatherData[b]?.lon || 0
          );
          return sortOrder === "asc"
            ? distanceA - distanceB
            : distanceB - distanceA;
        } else if (criteria === "temperature") {
          // Check if temperature data is valid
          const tempA = parseFloat(weatherData[a]?.temp);
          const tempB = parseFloat(weatherData[b]?.temp);

          // Sort as numbers if valid, otherwise handle as NaN values
          if (!isNaN(tempA) && !isNaN(tempB)) {
            return sortOrder === "asc" ? tempA - tempB : tempB - tempA;
          } else {
            // Handle cases where temperature data is invalid
            // You can decide on an appropriate fallback behavior here
            // For example, place cities with invalid temperature data at the end
            return sortOrder === "asc" ? 1 : -1;
          }
        } else {
          // Default sorting is alphabetical
          return sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a);
        }
      });
    };
  }, [weatherData, currentLocation, sortOrder]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Calculate the distance between two sets of coordinates
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  };

  const handleAddCityBoxClick = () => {
    setIsSearching(true); // Open the popup
  };

  const handleCancelSearch = () => {
    setIsSearching(false); // Close the popup
    setPopupCity("");
    setErrorFetchingCity(false); // Reset the error state
  };

  const handleAddCity = () => {
    if (popupCity.trim() === "") {
      return;
    }

    // Check for duplication
    if (Object.keys(weatherData).includes(popupCity)) {
      // City already exists, show an alert and return
      window.alert(`${popupCity} is already in your list!`);
      setPopupCity("");
      setIsSearching(false); // Close the popup
      setShowAddCityPopup(false); // Close the add city popup
      return;
    }

    // Continue with adding the city
    // Construct the API URL
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${popupCity}&appid=${API_KEY}&units=metric`;

    // Make the API request
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Check if the response contains valid weather data
        if (!data.main || !data.weather || data.weather.length === 0) {
          // City not found or invalid data, show an alert
          window.alert(`City '${popupCity}' not found or data is invalid.`);
          return;
        }

        // Update the weather data for the city, including rain data
        const updatedData = { ...weatherData };
        updatedData[popupCity] = {
          country: data.sys.country,
          temp: Number(data.main.temp), // Convert to float
          temp_min: Number(data.main.temp_min), // Convert to float
          temp_max: Number(data.main.temp_max), // Convert to float
          weathermood: data.weather[0].main,
          humidity: data.main.humidity,
          speed: data.wind.speed,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          lat: data.coord.lat,
          lon: data.coord.lon,
          rain: data.rain?.["1h"] || 0, // Rainfall in the last 1 hour (default to 0 if not available)
        };
        setWeatherData(updatedData);

        const updatedCities = Object.keys(updatedData); // Get the list of cities
        setPopupCity(""); // Clear the input field
        setIsSearching(false); // Close the popup
        setShowAddCityPopup(false); // Close the add city popup

        // After adding the city, scroll to its position in the list
        const cityElement = document.getElementById(popupCity);
        if (cityElement) {
          cityElement.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((error) => {
        console.error(`Error fetching weather data for ${popupCity}:`, error);
        setErrorFetchingCity(true); // Set the error state to true
      });
  };

  const handleRemoveCity = (city) => {
    const updatedData = { ...weatherData };
    delete updatedData[city];
    setWeatherData(updatedData);
  };

  const handleAddCityFromBox = (city) => {
    if (city.trim() === "") {
      return;
    }

    // Check for duplication
    if (Object.keys(weatherData).includes(city)) {
      // City already exists, no need to add again
      setShowAddCityPopup(true); // Open the add city popup
      setPopupCity(city); // Set the city in the input field
      return;
    }

    // Construct the API URL
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    // Make the API request
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Update the weather data for the city, including rain data
        const updatedData = { ...weatherData };
        updatedData[city] = {
          country: data.sys.country,
          temp: data.main.temp,
          temp_min: data.main.temp_min,
          temp_max: data.main.temp_max,
          weathermood: data.weather[0].main,
          humidity: data.main.humidity,
          speed: data.wind.speed,
          sunrise: data.sys.sunrise,
          sunset: data.sys.sunset,
          lat: data.coord.lat,
          lon: data.coord.lon,
          rain: data.rain?.["1h"] || 0, // Rainfall in the last 1 hour (default to 0 if not available)
        };
        setWeatherData(updatedData);

        const updatedCities = Object.keys(updatedData); // Get the list of cities
        setShowAddCityPopup(false); // Close the add city popup
        // Optionally, scroll to the added city's position in the list
        const cityElement = document.getElementById(city);
        if (cityElement) {
          cityElement.scrollIntoView({ behavior: "smooth" });
        }
      })
      .catch((error) => {
        console.error(`Error fetching weather data for ${city}:`, error);
        setErrorFetchingCity(true); // Set the error state to true
      });
  };

  const fetchLiveRainData = () => {
    // Fetch live rain data for favorite cities
    Object.keys(weatherData).forEach((city) => {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

      // Make the API request
      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          // Update the live rain data for the city
          const updatedData = { ...weatherData };
          updatedData[city] = {
            ...updatedData[city],
            rain: data.rain?.["1h"] || 0, // Rainfall in the last 1 hour (default to 0 if not available)
          };
          setWeatherData(updatedData);
        })
        .catch((error) => {
          console.error(`Error fetching live weather data for ${city}:`, error);
        });
    });
  };

  useEffect(() => {
    // Save weatherData to localStorage whenever it changes
    localStorage.setItem("weatherData", JSON.stringify(weatherData));
  }, [weatherData]);

  return (
    <>
      <div className="sorting-and-search">
        <div className="search-and-sort">
          <div className="button-bar">
            <input
              type="text"
              placeholder="Add to Favourites..."
              value={popupCity}
              onChange={(e) => setPopupCity(e.target.value)}
              className="city-input"
              list="cities"
            />
            <datalist id="cities">
              {autocompleteData.map((suggestion, index) => (
                <option key={index} value={suggestion} />
              ))}
            </datalist>
            <button onClick={handleAddCity} className="add-button">
              Add
            </button>
          </div>
          <div className="sorting-options">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="alphabetical">Alphabetical</option>
              <option value="temperature">Temperature</option>
              <option value="rain">Rain</option>
              <option value="distance">Distance</option>
            </select>
            <label style={{ marginLeft: "10px" }}>Order:</label>
            <select
              value={sortOrder}
              onChange={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
              className="sort-order-button"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {isSearching && (
        <div className="popup">
          <div className="popup-content">
            <input
              type="text"
              placeholder="Enter city name..."
              value={popupCity}
              onChange={(e) => setPopupCity(e.target.value)}
            />
            <div className="button-container">
              <button onClick={handleAddCity} className="add-button">
                Add
              </button>
              <button onClick={handleCancelSearch} className="cancel-button">
                Cancel
              </button>
            </div>

            {errorFetchingCity && (
              <p>Error fetching city suggestions. Please try again later.</p>
            )}
          </div>
        </div>
      )}

      <div className="city-list">
        {Object.keys(weatherData).length === 0 ? (
          <div className="empty-list-message">
            <p>Your list is empty. Add your favorite cities!</p>
          </div>
        ) : (
          <>
            {sortCities(Object.keys(weatherData), sortBy).map((city) => (
              <div className="weather-box wide-box" key={city} id={city}>
                <span>
                  <button
                    className="remove"
                    onClick={() => handleRemoveCity(city)}
                  >
                    Delete
                  </button>{" "}
                  {/* Remove button */}
                </span>
                <div className="city-header">
                  <span className="city-name">{city}</span>
                  <span className="country">
                    {weatherData[city]?.country || "N/A"}
                  </span>
                </div>
                <div className="mood">
                  {weatherData[city]?.weathermood || "N/A"}
                </div>
                <div className="city-temperature">
                  {weatherData[city]?.temp || "N/A"}°C
                </div>
                <div className="city-details">
                  <div className="temp-min-max">
                    <span>Min: {weatherData[city]?.temp_min || "N/A"}°C</span>
                    <span>Max: {weatherData[city]?.temp_max || "N/A"}°C</span>
                  </div>
                  <div className="extra-details">
                    <p>Humidity: {weatherData[city]?.humidity || "N/A"}%</p>
                    <p>Wind: {weatherData[city]?.speed || "N/A"} km/h</p>
                    <p>Rain: {weatherData[city]?.rain || 0} mm</p>
                    <p>
                      Distance:{" "}
                      {weatherData[city]
                        ? calculateDistance(
                            currentLocation?.lat || 0,
                            currentLocation?.lon || 0,
                            weatherData[city]?.lat || 0,
                            weatherData[city]?.lon || 0
                          ).toFixed(2)
                        : "N/A"}{" "}
                      km
                    </p>

                    <p>
                      Sunrise:{" "}
                      {weatherData[city]
                        ? new Date(
                            weatherData[city]?.sunrise * 1000
                          ).toLocaleTimeString()
                        : "N/A"}
                    </p>
                    <p>
                      Sunset:{" "}
                      {weatherData[city]
                        ? new Date(
                            weatherData[city]?.sunset * 1000
                          ).toLocaleTimeString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="box-buttons"></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showAddCityPopup && (
        <div className="popup">
          <div className="popup-content">
            <input
              type="text"
              placeholder="Enter city name..."
              value={popupCity}
              onChange={(e) => setPopupCity(e.target.value)}
            />

            <button onClick={handleAddCity} className="add-button">
              Add
            </button>
            <button
              onClick={() => setShowAddCityPopup(false)}
              className="cancel-button"
            >
              Cancel
            </button>

            {errorFetchingCity && (
              <p>Error fetching city suggestions. Please try again later.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FavCities;
