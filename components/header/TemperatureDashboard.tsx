import React from "react";
import Temperature from "../../types/temperature.type";

function TemperatureDashboard({ temperature }: { temperature: Temperature }) {
  return (
    <div className="absolute -bottom-[156px] -left-4 min-w-max bg-background2 p-2 border-foreground border-[1px] rounded-lg">
      <div className="font-bold">Weather</div>
      <div className="flex justify-between">
        <span className="w-20">Now</span>
        <span>{temperature.main.temp} °C</span>
      </div>
      <div className="flex justify-between">
        <span className="w-20">Range</span>
        <span>
          {temperature.main.temp_min} - {temperature.main.temp_max} °C
        </span>
      </div>
      <div className="flex justify-between">
        <span className="w-20">Humidity</span>
        <span>{temperature.main.humidity}</span>
      </div>
      <div className="flex justify-between">
        <span className="w-20">Sunrise</span>
        <span>{`${new Date(
          temperature.sys.sunrise * 1000
        ).toLocaleTimeString()}`}</span>
      </div>
      <div className="flex justify-between">
        <span className="w-20">Sunset</span>
        <span>{`${new Date(
          temperature.sys.sunset * 1000
        ).toLocaleTimeString()}`}</span>
      </div>
    </div>
  );
}

export default TemperatureDashboard;
