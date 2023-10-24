import React from "react";
import {
  UilTemperature,
  UilTear,
  UilWind,
  UilSun,
  UilSunset,
} from "@iconscout/react-unicons";
import { formatToLocalTime, iconUrlFromCode } from "./weatherService";

function TemperatureAndDetails({
  weather: {
    details,
    icon,
    temp,
    temp_min,
    temp_max,
    sunrise,
    sunset,
    speed,
    humidity,
    feels_like,
    timezone,
  },
}) {
  return (
    <div>
      <div className="text-center py-6 text-xl text-cyan-300">
        <p>{details}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center text-white py-3">
        <img src={iconUrlFromCode(icon)} alt="" className="w-20" />
        <p className="text-5xl md:text-6xl">{`${temp.toFixed()}°`}</p>
        <div className="flex flex-col space-y-2 md:space-y-0 md:ml-6">
          <div className="flex font-light text-sm items-center justify-center">
            <UilTemperature size={18} className="mr-1" />
            Real Feel:
            <span className="font-medium ml-1">{`${feels_like.toFixed()}°`}</span>
          </div>
          <div className="flex font-light text-sm items-center justify-center">
            <UilTear size={18} className="mr-1" />
            Humidity:
            <span className="font-medium ml-1">{`${humidity.toFixed()}%`}</span>
          </div>
          <div className="flex font-light text-sm items-center justify-center">
            <UilWind size={18} className="mr-1" />
            Wind:
            <span className="font-medium ml-1">{`${speed.toFixed()} km/h`}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center space-y-1 md:space-x-4 text-white text-sm py-3">
        <div className="flex items-center">
          <UilSun />
          <p className="font-light ml-1">
            Rise:{" "}
            <span className="font-medium">
              {formatToLocalTime(sunrise, timezone, "hh:mm a")}
            </span>
          </p>
        </div>
        <div className="flex items-center">
          <UilSunset />
          <p className="font-light ml-1">
            Set:{" "}
            <span className="font-medium">
              {formatToLocalTime(sunset, timezone, "hh:mm a")}
            </span>
          </p>
        </div>
        <div className="flex items-center">
          <UilSun />
          <p className="font-light ml-1">
            High:{" "}
            <span className="font-medium">{`${temp_max.toFixed()}°`}</span>
          </p>
        </div>
        <div className="flex items-center">
          <UilSun />
          <p className="font-light ml-1">
            Low:{" "}
            <span className="font-medium">{`${temp_min.toFixed()}°`}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TemperatureAndDetails;