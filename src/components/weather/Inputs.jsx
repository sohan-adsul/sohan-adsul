import React, { useState } from "react";
import { UilSearch, UilLocationPoint } from "@iconscout/react-unicons";
import { toast } from "react-toastify";

function Inputs({ setQuery, units, setUnits }) {
  const [city, setCity] = useState("");

  const handleUnitsChange = (e) => {
    const selectedUnit = e.currentTarget.name;
    if (units !== selectedUnit) setUnits(selectedUnit);
  };

  const handleSearchClick = () => {
    if (city !== "") setQuery({ q: city });
  };

  const handleLocationClick = () => {
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            getCurrentLocation();
          } else if (permissionStatus.state === "prompt") {
            permissionStatus.onchange = () => {
              if (permissionStatus.state === "granted") {
                getCurrentLocation();
              } else {
                // Handle denied permission
                toast.error("Location permission denied.");
              }
            };
          } else {
            // Handle denied permission
            toast.error("Location permission denied.");
          }
        })
        .catch((error) => {
          console.error("Error checking geolocation permission:", error);
          // Handle error
        });
    } else {
      // Geolocation not supported
      toast.error("Geolocation is not supported in this browser.");
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        setQuery({
          lat,
          lon,
        });
      });
    } else {
      // Geolocation not supported
      toast.error("Geolocation is not supported in this browser.");
    }
  };

  return (
    <div className="flex flex-col items-center  my-6 mx-auto"
    style={{ width: "65%" }}>
      
      <div className="flex flex-row items-center space-x-4 w-full mb-4">
        <input
  value={city}
  onChange={(e) => setCity(e.currentTarget.value)}
  type="text"
          placeholder="search for city..."
          
  className="text-xl font-light p-2 w-2/3 mx-auto shadow-xl focus:outline-none  placeholder-lowercase"
/>

        <UilSearch
          size={25}
          className="text-white cursor-pointer transition ease-out hover:scale-150"
          
          onClick={handleSearchClick}
        />
        <UilLocationPoint
          size={25}
          className="text-white cursor-pointer transition ease-out hover:scale-150"
          onClick={handleLocationClick}
        />
      </div>

      <div className="flex flex-row items-center justify-center w-full">
        <button
          name="metric"
          className="text-xl text-white font-light transition ease-out hover:scale-125 bg-transparent"
          onClick={handleUnitsChange}
        >
          °C
        </button>
        <p className="text-xl text-white mx-1">|</p>
        <button
          name="imperial"
          className="text-xl text-white font-light transition ease-out hover:scale-125 bg-transparent"
          onClick={handleUnitsChange}
        >
          °F
        </button>
      </div>
    </div>
  );
}

export default Inputs;
