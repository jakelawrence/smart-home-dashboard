"use client";
import React, { useState, useEffect } from "react";
import { Clock, Cloud, Car, Calendar, Sun, CloudRain, Wind, Droplets } from "lucide-react";

// CONFIGURATION FILE - Edit this to customize your dashboard
const DASHBOARD_CONFIG = {
  // Your home location for commute calculations
  homeLocation: "2727 N Mainplace Dr, Santa Ana",

  // Your work location
  workLocation: "13155 Rail13155 Railroad Ave, Bassett",

  // Commute display hours (24-hour format)
  commuteStartHour: 7,
  commuteEndHour: 9,

  // Widget configuration - easily add/remove widgets here
  widgets: [
    {
      id: "clock",
      name: "Clock",
      enabled: true,
      size: "large", // small, medium, large
      alwaysShow: true,
    },
    {
      id: "weather",
      name: "Weather",
      enabled: true,
      size: "large",
      alwaysShow: true,
      city: "Santa Ana, CA",
      units: "imperial", // imperial for °F, metric for °C
    },
    {
      id: "commute",
      name: "Commute",
      enabled: true,
      size: "large",
      showOnlyDuringHours: true, // Only show during commute hours
      // You'll need a Google Maps API key
      apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    },
    {
      id: "calendar",
      name: "Calendar",
      enabled: true,
      size: "large",
      showAfterHour: 9, // Show after 9 AM
      // You'll need Google Calendar API credentials
      calendarId: "primary", // or your specific calendar ID
      apiKey: "YOUR_GOOGLE_CALENDAR_API_KEY",
    },
  ],

  // Display settings
  darkMode: true,
  refreshInterval: 60000, // Refresh data every 60 seconds
};

function formatForUrl(str) {
  return encodeURIComponent(str);
}

// Clock Widget
const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Time</h2>
      </div>
      <div className="text-6xl font-bold mb-2">{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
      <div className="text-2xl opacity-90">{time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
    </div>
  );
};

// Weather Widget
const WeatherWidget = ({ config }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!config.city || config.city === "") {
        setWeather({
          temp: 72,
          description: "Demo Mode",
          humidity: 65,
          windSpeed: 8,
          icon: "demo",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${formatForUrl(
            config.city
          )}?unitGroup=us&key=UQALJBBAJ46X5K3VRSLMXQU4P&contentType=json`
        );
        const data = await response.json();
        const todayData = data.days[0];
        setWeather({
          temp: Math.round(todayData.temp),
          description: todayData.condition,
          humidity: todayData.humidity,
          windSpeed: Math.round(todayData.windspeed),
          icon: todayData.icon,
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
      setLoading(false);
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, DASHBOARD_CONFIG.refreshInterval);
    return () => clearInterval(interval);
  }, [config]);

  if (loading) return <div className="bg-gray-800 rounded-2xl p-8 text-white">Loading weather...</div>;

  const getWeatherIcon = () => {
    return <img src={`/weather-icons/${weather.icon.toLowerCase()}.png`} alt={weather.description} className="w-16 h-16" />;
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        {getWeatherIcon()}
        <div>
          <h2 className="text-2xl font-bold">Weather</h2>
          <p className="text-lg opacity-90 capitalize">{weather.description}</p>
        </div>
      </div>
      <div className="text-6xl font-bold mb-4">
        {weather.temp}°{config.units === "imperial" ? "F" : "C"}
      </div>
      <div className="grid grid-cols-2 gap-4 text-lg">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          <span>{weather.humidity}% Humidity</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5" />
          <span>{weather.windSpeed} mph</span>
        </div>
      </div>
    </div>
  );
};

// Commute Widget
const CommuteWidget = ({ config }) => {
  const [commute, setCommute] = useState(null);

  useEffect(() => {
    const fetchCommute = async () => {
      if (!config.apiKey || config.apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
        setCommute({
          duration: "25 mins",
          arrival: new Date(Date.now() + 25 * 60000).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          traffic: "Light traffic",
        });
        return;
      }

      // Real API call would go here
      try {
        // const response = await fetch(...);
        // Parse and set real data
      } catch (error) {
        console.error("Commute fetch error:", error);
      }
    };

    fetchCommute();
    const interval = setInterval(fetchCommute, DASHBOARD_CONFIG.refreshInterval);
    return () => clearInterval(interval);
  }, [config]);

  if (!commute) return null;

  return (
    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Car className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Commute to Work</h2>
      </div>
      <div className="text-5xl font-bold mb-2">{commute.duration}</div>
      <div className="text-2xl mb-4">Arrive by {commute.arrival}</div>
      <div className="text-lg opacity-90">{commute.traffic}</div>
    </div>
  );
};

// Calendar Widget
const CalendarWidget = ({ config }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!config.apiKey || config.apiKey === "YOUR_GOOGLE_CALENDAR_API_KEY") {
        setEvents([
          { id: 1, title: "Team Meeting", time: "10:00 AM", duration: "1 hour" },
          { id: 2, title: "Lunch with Client", time: "12:30 PM", duration: "1.5 hours" },
          { id: 3, title: "Project Review", time: "3:00 PM", duration: "45 mins" },
        ]);
        return;
      }

      // Real API call would go here
      try {
        // const response = await fetch(...);
        // Parse and set real data
      } catch (error) {
        console.error("Calendar fetch error:", error);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, DASHBOARD_CONFIG.refreshInterval);
    return () => clearInterval(interval);
  }, [config]);

  return (
    <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Today's Events</h2>
      </div>
      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-xl opacity-90">No events scheduled</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white/20 rounded-lg p-4">
              <div className="font-bold text-xl mb-1">{event.title}</div>
              <div className="text-lg opacity-90">
                {event.time} • {event.duration}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const shouldShowWidget = (widget) => {
    if (!widget.enabled) return false;
    if (widget.alwaysShow) return true;

    if (widget.showOnlyDuringHours) {
      return currentHour >= DASHBOARD_CONFIG.commuteStartHour && currentHour < DASHBOARD_CONFIG.commuteEndHour;
    }

    if (widget.showAfterHour) {
      return currentHour >= widget.showAfterHour;
    }

    return true;
  };

  const renderWidget = (widget) => {
    switch (widget.id) {
      case "clock":
        return <ClockWidget key={widget.id} />;
      case "weather":
        return <WeatherWidget key={widget.id} config={widget} />;
      case "commute":
        return <CommuteWidget key={widget.id} config={widget} />;
      case "calendar":
        return <CalendarWidget key={widget.id} config={widget} />;
      default:
        return null;
    }
  };

  const visibleWidgets = DASHBOARD_CONFIG.widgets.filter(shouldShowWidget);

  return (
    <div className={`min-h-screen p-6 ${DASHBOARD_CONFIG.darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{visibleWidgets.map((widget) => renderWidget(widget))}</div>
      </div>
    </div>
  );
}
