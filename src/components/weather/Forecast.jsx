import React from "react";
import { iconUrlFromCode } from "./weatherService";

function Forecast({ title, items }) {
  return (
    <div>
      <div className="flex items-center justify-center mt-6">
        <p className="text-white font-medium uppercase">{title}</p>
      </div>
      <hr className="my-2" />

      <div className="flex flex-row overflow-x-auto text-white justify-center items-center">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-2">
            <p className="font-light text-sm text-align-center">{item.title}</p>
            <img
              src={iconUrlFromCode(item.icon)}
              className="w-12 my-1"
              alt=""
            />
            <p className="font-medium">{`${item.temp.toFixed()}°`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forecast;
