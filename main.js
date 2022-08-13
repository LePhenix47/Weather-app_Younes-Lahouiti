const currentWeatherAppAPIKey = "eb43ae8f0b5ee3389473805bd179c44e";

const forecastsWeatherApAPIKey = "a783ff1b655a8efef32760dc98437171"; //DOES NOT WORK

const urlCountryFlagsAPI = "https://countryflagsapi.com/png/";

const flagImage = document.querySelector(".card__info-location-flag");

const locationName = document.querySelector(".card__info-location>h2");

const currentDegreesCelsius = document.querySelector(".card__info-degrees>h2");

const svgIcon = document.querySelector(".card__info-icon>img");

const currentHour = new Date().getHours();

let forecastsDataHourly = [];
let forecastsDataDaily = [];
let calls = 0;

async function callCurrentWeatherAPI(longitude, latitude) {
  try {
    // console.log(
    //   "waiting for the API to respond, coordinates given: \n",
    //   "Latitude: ",
    //   latitude,
    //   "\n Longitude: ",
    //   longitude
    // );
    const urlCurrentWeatherAppAPI = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${currentWeatherAppAPIKey}&units=metric`; //metric >>> imperial

    let response = await fetch(urlCurrentWeatherAppAPI);
    let currentWeather = await response.json();

    changeCurrentWeatherUI(currentWeather);

    // console.log("Current weather API response: ", currentWeather);
  } catch (APIerror) {
    console.error(APIerror);
  }
}

async function callForecastsWeatherAPI(longitude, latitude) {
  try {
    const urlForecastsWeatherAppAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,current&units=metric&appid=${forecastsWeatherApAPIKey}`; //metric >>> imperial
    let response = await fetch(urlForecastsWeatherAppAPI);
    let weatherForecasts = await response.json();

    console.log("Forecasts API response: ", weatherForecasts);
    forecastsDataHourly = weatherForecasts.hourly;
    forecastsDataDaily = weatherForecasts.daily;

    changeHourlyTemperatures();
    changeDailyTemperatures();

    // console.log(forecastsDataHourly, forecastsDataDaily);
  } catch (APIerror) {
    console.error(APIerror);
  }
}

let currentLatitude = 0;
let currentLongitude = 0;
let locationCalls = 0;

function getUserCoordinatesAndGiveLocalWeather() {
  if (locationCalls === 0) {
    navigator.geolocation.getCurrentPosition((position) => {
      //WARNING: If you ever plan on making a weather application, you should use getCurrentPosition() than watchPosition() otherwise it will call these functions every few minutes
      currentLatitude = position.coords.latitude;
      currentLongitude = position.coords.longitude;
      // console.log("Watch position: ", position.coords);
      callCurrentWeatherAPI(currentLongitude, currentLatitude);
      callForecastsWeatherAPI(currentLongitude, currentLatitude);
    });
  } else {
    return;
  }
  locationCalls++;
}

getUserCoordinatesAndGiveLocalWeather();

// Part 1 Current weather
function changeCurrentWeatherUI(weatherAPIResponse) {
  const { main, name, sys, weather } = weatherAPIResponse;
  let currentTemperature = Math.trunc(main.temp);
  let weatherIconName = weather[0].icon;

  flagImage.setAttribute("src", `${urlCountryFlagsAPI}${sys.country}`);
  flagImage.setAttribute("alt", `${sys.country} flag`);
  flagImage.setAttribute("title", `${sys.country} flag`);

  locationName.textContent = `${name}`;
  currentDegreesCelsius.textContent = `${currentTemperature}°C`;

  let svgIconDirectoryURL = "./ressources/";

  let isItDayOrNight = weatherIconName.includes("d") ? "jour/" : "nuit/";

  let urlOfSvg =
    svgIconDirectoryURL + isItDayOrNight + weatherIconName + ".svg";
  // console.log("URL of SVG = ", urlOfSvg);

  let svgAlternativeText = //This variable is going to contain the concatenation of 2 characters, let's say the message is "clear sky",
    weather[0].description.charAt(0).toUpperCase() + //We take the first letter of the word and we turn it into its capital: "c" → "C"
    weather[0].description.slice(1); //We take the rest of the word after the 1st letter (index = 1 since the 1st letter is at index = 0)

  svgIcon.setAttribute("src", urlOfSvg);
  svgIcon.setAttribute("alt", `${svgAlternativeText} weather icon`);
  svgIcon.setAttribute("title", `Today:  ${weather[0].description} `);
}

//Part 2 Hourly forecasts of the day
const hourlyHourCards = document.querySelectorAll(".card__hour>h3");

const hourlyTemperatureCards = document.querySelectorAll(".card__hour>p");

let addThreeHours = 3;

function changeHourlyTemperatures() {
  if (calls >= 1) {
    return;
  }
  for (let i = 0; i < hourlyHourCards.length; i++) {
    let hours = (currentHour + addThreeHours) % 24;

    if (hours < 10) {
      hours = `0${hours}`;
    }

    hourlyHourCards[i].textContent = `${hours}h`;
    addThreeHours += 3;
    hourlyTemperatureCards[i].textContent = `${Math.trunc(
      forecastsDataHourly[i * 3]?.temp //0 3 6 9 → Index of every 3 hour forecasts
    )}°C`;
  }
  calls++;
  return;
}

//Part 3 Forecasts of the week
const dailyHourCards = document.querySelectorAll(".card__day>h3");

const dailyTemperatureCards = document.querySelectorAll(".card__day>p");

const daysOfTheWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const currentDay = new Date().toLocaleDateString("en-EN", {
  weekday: "long",
});

let orderedDaysInWeek = daysOfTheWeek
  .slice(daysOfTheWeek.indexOf(currentDay) + 1) //We take the array of days and take the days after the current day
  .concat(daysOfTheWeek.slice(0, daysOfTheWeek.indexOf(currentDay) + 1)); //we concatenate it with the array of the reamining days

function changeDailyTemperatures() {
  for (let i = 0; i < dailyHourCards.length; i++) {
    dailyHourCards[i].textContent = `${orderedDaysInWeek[i].substring(0, 3)}`;
    dailyTemperatureCards[i].textContent = `${Math.trunc(
      forecastsDataDaily[i].temp.day
    )}°C`;
  }
}
