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
  