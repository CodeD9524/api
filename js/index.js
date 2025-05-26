async function fetchData() {
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=temperature_2m_max');
      
      if (!response.ok) {
        throw new Error('Request failed');
      }
      
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
  fetchData();
  async function fetchWeatherData(dataPoint) {
    const latitude = 35.2; 
    const longitude = -80.4;
    const baseUrl = 'https://api.open-meteo.com/v1/forecast';
    const url = `${baseUrl}?latitude=${latitude}&longitude=${longitude}&daily=${dataPoint}&timezone=auto`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch weather data');
  
      const data = await response.json();
      displayWeatherData(data, dataPoint);
    } catch(error) {
      document.getElementById('weather-display').textContent = 'Error loading weather data.';
      console.error(error);
    }
  }
  function displayWeatherData(data, dataPoint) {
    const weatherDiv = document.getElementById('weather-display');
    const dates = data.daily.time;
    const values = data.daily[dataPoint];
  
    let html = `<h3>${dataPoint.replace(/_/g, ' ')}</h3>`;
    html += '<ul>';
    for (let i = 0; i < dates.length; i++) {
      html += `<li>${dates[i]}: ${values[i]}°C</li>`;
    }
    html += '</ul>';
  
    weatherDiv.innerHTML = html;
  }
  document.getElementById('maxTempBtn').addEventListener('click', () => {
    fetchWeatherData('temperature_2m_max');
  });
  
  document.getElementById('minTempBtn').addEventListener('click', () => {
    fetchWeatherData('temperature_2m_min');
  });
  window.addEventListener('load', () => {
    fetchWeatherData('temperature_2m_max');  // Load max temperature as default
  });