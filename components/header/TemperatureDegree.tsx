import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import Location from "../../types/location.type";
import TemperatureDashboard from "./TemperatureDashboard";
import Temperature from "../../types/temperature.type";

function TemperatureDegree({ location }: { location: Location }) {
  const [temperatureLoading, setTemperatureLoading] = useState(false);
  const [temperature, setTemperature] = useState<Temperature | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Update temperature every 5 minutes
    updateTemperature({ lat: location.lat, lng: location.lng });
    const interval = setInterval(() => {
      updateTemperature({ lat: location.lat, lng: location.lng });
    }, 1000 * 60 * 5);

    return () => clearInterval(interval);
  }, [location]);

  const updateTemperature = async ({
    lat,
    lng,
  }: {
    lat: number;
    lng: number;
  }) => {
    try {
      setTemperatureLoading(true);

      const { data }: { data: Temperature } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=a824fa87d701dca1e473519f17f09036`
      );

      setTemperatureLoading(false);
      setTemperature(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="ml-4 flex items-center justify-center w-[58px] relative"
      onMouseOver={() => setShowDashboard(true)}
      onMouseLeave={() => setShowDashboard(false)}
    >
      {temperature && !temperatureLoading && `${temperature.main.temp}°C`}
      {temperatureLoading && (
        <CircularProgress size={20} color="inherit" thickness={6} />
      )}
      {showDashboard && temperature && (
        <TemperatureDashboard temperature={temperature} />
      )}
    </div>
  );
}

export default TemperatureDegree;
