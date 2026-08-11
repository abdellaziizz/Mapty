'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = (this.date.now + '').slice(-10);
  constructor(coords, distnace, duration) {
    this.coords = coords; //[lat,long]
    this.distnace = distnace; // in Km
    this.duration = duration; // in min
  }
}
class Running extends Workout {
  constructor(coords, distnace, duration, cadence) {
    super(coords, distnace, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    //min/km
    this.pace = this.duration / this.distnace;
    return this.pace;
  }
}
//testing
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Running([39, -12], 27, 95, 523);
// console.log(cycling1, run1);

class Cycling extends Workout {
  constructor(coords, distnace, duration, elevationGain) {
    super(coords, distnace, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    //km/h
    this.speed = this.distnace / (this.duration / 60);
    return this.speed;
  }
}
class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        console.log('cannot find your position');
      },
    );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    this.#map = L.map('map').setView(coords, 13); //13 is zooming in and out
    this.#map.on('click', this._showForm.bind(this));
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    const validation = (...input) => input.every(inp => !Number.isFinite(inp));
    const allPositive = (...input) => input.every(inp => inp > 0);

    //getting the data from the form
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = NumberA(inputDuration.value);

    //if workout's running, create running object
    if (type === 'running') {
      const cadence = Number(inputCadence.value);
      //checking input validation
      if (
        !validation(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('input has to be Number');
    }
    //if workout's cycling, create cycling object
    if (type === 'cycling') {
      const elevation = Number(inputElevation.value);
      //checking input validation
      if (
        !validation(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('input has to be Number');
    }
    e.PreventDefault();
    const { lat, lng } = this.#mapEvent.latlng;
    //Clear input fields
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        }),
      )
      .setPopupContent('Workout ')
      .openPopup();
  }
}
const app = new App();
