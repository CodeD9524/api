// Map Open-Meteo weather codes to descriptions
const weatherCodeDescriptions = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Dense Freezing Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snow Fall',
  73: 'Moderate Snow Fall',
  75: 'Heavy Snow Fall',
  77: 'Snow Grains',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail'
};

// Select UI elements
const tabs = document.querySelectorAll('.tab-btn');
const weatherDisplay = document.getElementById('weather-display');
const citySelector = document.getElementById('citySelector');
const likelyWeatherDisplay = document.getElementById('most-likely-weather'); // Make sure this exists in your HTML
// Fetch weather data for  location
async function fetchWeatherData(dataPoint, latitude, longitude) {
  const baseUrl = 'https://api.open-meteo.com/v1/forecast';
  const url = `${baseUrl}?latitude=${latitude}&longitude=${longitude}&daily=${dataPoint}&timezone=auto`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    displayWeatherData(data, dataPoint);
  } catch (error) {
    weatherDisplay.textContent = 'Error loading weather data.';
    console.error(error);
  }
}
// Display weather data in UI
function displayWeatherData(data, dataPoint) {
  const dates = data.daily.time;
  const values = data.daily[dataPoint];
  let html = '';
  if (dataPoint === 'weathercode') {
    html += `<h3>Weather Conditions</h3><ul>`;
    for (let i = 0; i < dates.length; i++) {
      const description = weatherCodeDescriptions[values[i]] || 'Unknown';
      html += `<li>${dates[i]}: ${description} (code: ${values[i]})</li>`;
    }
    html += '</ul>';
  } else {
    const title = dataPoint.replace(/_/g, ' ');
    html += `<h3>${title}</h3><ul>`;
    for (let i = 0; i < dates.length; i++) {
      html += `<li>${dates[i]}: ${values[i]} °C</li>`;
    }
    html += '</ul>';
  }
  weatherDisplay.innerHTML = html;
}
// Fetch weather codes for a date Again, boy, if it's 2 o'clock
async function fetchWeatherCodes(latitude, longitude, startDate, endDate) {
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=weathercode&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather data');

  const data = await response.json();
  return data.daily.weathercode;
}
// Give me the weather for the location, such as snowy, rainy, etc.
function getMostLikelyWeatherCode(codes) {
  const frequency = {};
  codes.forEach(code => {
    frequency[code] = (frequency[code] || 0) + 1;
  });
  let mostFrequentCode = null;
  let maxCount = 0;
  for (const code in frequency) {
    if (frequency[code] > maxCount) {
      maxCount = frequency[code];
      mostFrequentCode = Number(code);
    }
  }
  return mostFrequentCode;
}
async function getMostLikelyWeather(latitude, longitude, startDate, endDate) {
  try {
    const codes = await fetchWeatherCodes(latitude, longitude, startDate, endDate);
    const mostLikelyCode = getMostLikelyWeatherCode(codes);
    const condition = weatherCodeDescriptions[mostLikelyCode] || 'Unknown';
    return condition;
  } catch (error) {
    console.error(error);
    return 'Error fetching weather data';
  }
}
function handleTabClick(event) {
  tabs.forEach(tab => tab.classList.remove('active'));
  const clickedTab = event.currentTarget;
  clickedTab.classList.add('active');
  const dataPoint = clickedTab.getAttribute('data-endpoint');
  if (!citySelector.value) {
    weatherDisplay.textContent = 'Please select a city.';
    return;
  }
  const [lat, lon] = citySelector.value.split(',').map(Number);
  fetchWeatherData(dataPoint, lat, lon);
}
tabs.forEach(tab => {
  tab.addEventListener('click', handleTabClick);
});
window.addEventListener('DOMContentLoaded', () => {
  const defaultTab = document.querySelector('.tab-btn.active') || tabs[0];
  if (!defaultTab) {
    weatherDisplay.textContent = 'No tabs found.';
    return;
  }

  if (!citySelector.value) {
    weatherDisplay.textContent = 'Please select a city.';
    return;
  }

  const dataPoint = defaultTab.getAttribute('data-endpoint');
  const [lat, lon] = citySelector.value.split(',').map(Number);
  fetchWeatherData(dataPoint, lat, lon);

  // Compute 7-day range (past 7 days including today)
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now()).toISOString().split('T')[0];
  getMostLikelyWeather(lat, lon, startDate, endDate).then(condition => {
    if (likelyWeatherDisplay) {
      likelyWeatherDisplay.textContent = `Most Likely Weather (past 7 days): ${condition}`;
    }
  });
});