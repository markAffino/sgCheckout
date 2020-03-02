// ========================================
// Requires, globals
// ========================================

import moment from 'moment';
import localization from 'moment/locale/en-gb';
import dateSlider from './slider';

require('./index.css');
require('./slider.css');


// ========================================
// Variables
// ========================================

// Root
const deliveryOptions = document.querySelector('#delivery__wrapper');

const deliveryDateSelector = deliveryOptions.querySelector('#delivery__date-selector');
const deliveryTimeSelector = deliveryOptions.querySelector('#delivery__time-selector');
const deliveryDaySelector = deliveryOptions.querySelector('#delivery__day-selector');


// Data from Magento?
let excludedDates = ['16/03/2020', '17/03/2020', '24/12/2020', '25/12/2020', '26/12/2020'];
const saturdayDeliveryPrice = '54.00';
const standardDeliveryPrice = '0.00';
const amDeliveryPrice = '12.00';


// ========================================
// Functions
// ========================================

// Add/removes disabled attr dependent on selector
const enableDeliveryDates = (daysToDisable, daysToEnable) => {
  daysToDisable.forEach((day) => day.setAttribute('disabled', true));
  daysToEnable.forEach((day) => day.removeAttribute('disabled'));
};

// Remove class from array of items
const removeClassOnArray = (array, selector, classname) => {
  const elems = [...array.querySelectorAll(selector)];
  elems.forEach((elem) => {
    elem.classList.remove(classname);
  });
};


// Sets default based on time of day
const setDeliveryDayOptions = () => {
  const weekdays = [...deliveryDateSelector.querySelectorAll('.delivery__date-weekday')];
  const saturdays = [...deliveryDateSelector.querySelectorAll('.delivery__date-saturday')];
  const weekdayOne = weekdays[0];
  const weekdayOneParent = weekdayOne.parentElement;
  const weekdayTwo = weekdays[1];
  const weekdayThree = weekdays[2];
  const saturdayOne = saturdays[0];
  const saturdayOneParent = saturdayOne.parentElement;

  // Mock day & time
  // const currentTime = moment().set('hour', 9).get('hour');
  // const today = moment().set('date', 7).format('llll');

  // Get current day & time
  const today = moment().format('llll');
  const currentTime = moment().get('hour');

  // Saturday before 12
  if (today.includes('Sat') || today.includes('Sun')) {
    saturdayOneParent.parentElement.removeChild(saturdayOneParent);
    weekdayOneParent.parentElement.removeChild(weekdayOneParent);
    weekdayTwo.dataset.price = '12.00';
    weekdayTwo.lastElementChild.textContent = '£12.00';
    weekdayThree.classList.add('selected');
    return null;
  }
  // Friday after 12
  if (currentTime > 12 && today.includes('Fri')) {
    weekdayOneParent.parentElement.removeChild(weekdayOneParent);
    weekdayTwo.dataset.price = '12.00';
    weekdayTwo.lastElementChild.textContent = '£12.00';
    weekdayThree.classList.add('selected');
    saturdayOneParent.parentElement.removeChild(saturdayOneParent);
    return null;
  }
  // Friday before 12
  if (currentTime < 12 && today.includes('Fri')) {
    weekdayTwo.classList.add('selected');
    weekdayOne.dataset.price = '12.00';
    weekdayOne.lastElementChild.textContent = '£12.00';
    return null;
  }
  // Mon - Thurs after 12
  if (currentTime > 12) {
    weekdayTwo.classList.add('selected');
    weekdayOneParent.parentElement.removeChild(weekdayOneParent);
    return null;
  }
  // Mon - Thurs before 12
  if (currentTime < 12) {
    weekdayTwo.classList.add('selected');
    weekdayOne.dataset.price = '12.00';
    weekdayOne.lastElementChild.textContent = '£12.00';
    return null;
  }
  return null;
};


// Set dynamic delivery prices to labels & selectors
const setDynamicDeliveryPrice = () => {
  // Set delivery price data to day/time selectors
  const allDayDelivery = deliveryOptions.querySelector('#delivery__time-allday');
  const amDelivery = deliveryOptions.querySelector('#delivery__time-am');
  allDayDelivery.dataset.price = standardDeliveryPrice;
  amDelivery.dataset.price = amDeliveryPrice;

  // Create a price element & add to DOM
  const createPriceElement = (element, price) => {
    const displayPrice = document.createElement('span');
    displayPrice.textContent = `£${price}`;
    element.appendChild(displayPrice);
  };

  // Add delivery price data to AM selector HTML
  createPriceElement(amDelivery, amDeliveryPrice);

  // Add Saturday price data to Saturday button HTML
  const saturdayDelivery = deliveryOptions.querySelector('#delivery__day-saturday');
  createPriceElement(saturdayDelivery, saturdayDeliveryPrice);
};


// Get confirmation of selection and display on Front End
const getConfirmation = () => {
  const confirm = deliveryOptions.querySelector('#delivery__confirmation');
  const confirmDate = confirm.querySelector('.delivery__confirm-date');
  const confirmTime = confirm.querySelector('.delivery__confirm-time');
  const confirmPrice = confirm.querySelector('.delivery__confirm-price');

  // Check for delivery date & price
  const deliveryDate = [...deliveryDateSelector.querySelectorAll('.delivery__date')];
  deliveryDate.forEach((date) => {
    if (date.classList.contains('selected')) {
      const combinedDate = `${date.children[0].textContent} ${date.children[1].textContent}`;
      confirmDate.innerHTML = `Delivery date: <strong>${combinedDate}</strong>`;

      // Check if AM delivery is selected
      const checkAmDelivery = deliveryOptions.querySelector('#delivery__time-am.active');
      if (checkAmDelivery) {
        const price = parseInt(date.dataset.price) + parseInt(checkAmDelivery.dataset.price);
        confirmPrice.innerHTML = `Delivery price: <strong>£${price.toFixed(2)}</strong>`;
      } else {
        const price = parseInt(date.dataset.price);
        confirmPrice.innerHTML = `Delivery price: <strong>£${price.toFixed(2)}</strong>`;
      }
    }
  });

  // Check delivery time
  const deliveryTime = [...deliveryTimeSelector.querySelectorAll('button')];
  deliveryTime.forEach((time) => {
    if (time.classList.contains('active') && time.getAttribute('id') === 'delivery__time-am') {
      confirmTime.innerHTML = `Delivery time: (<strong>${time.firstElementChild.textContent.trim()}</strong>) between 8am - 12pm `;
    } else if (time.classList.contains('active')) {
      confirmTime.innerHTML = `Delivery time: (<strong>${time.firstElementChild.textContent.trim()}</strong>) between 8am - 6pm `;
    }
  });
};


// ========================================
// Create 30 day date range (uses Moment.js lib)
// ========================================

const createDateRange = () => {
  let allDates = [];
  let currentDate = moment(new Date()).add(1, 'day');
  const endDate = currentDate.clone().add(30, 'day');

  while (currentDate <= endDate) {
    let formattedDate = currentDate.locale('en-gb').format('llll');
    if (formattedDate.indexOf('Sun') === -1) {
      const displayDateFormat = moment(currentDate).locale('en-gb').format('llll');
      const localDateFormat = moment(currentDate).locale('en-gb').format('L');

      if (displayDateFormat.indexOf('Sat') >= 0) {
        allDates = [...allDates, {
          localdate: localDateFormat,
          displaydate: displayDateFormat.slice(0, displayDateFormat.length - 11),
          price: saturdayDeliveryPrice,
          day: 'delivery__date-saturday',
          state: 'disabled',
        }];
      } else {
        allDates = [...allDates, {
          localdate: localDateFormat,
          displaydate: displayDateFormat.slice(0, displayDateFormat.length - 11),
          price: standardDeliveryPrice,
          day: 'delivery__date-weekday',
          state: '',
        }];
      }
    }
    currentDate = moment(currentDate).add(1, 'days');
  }

  // Get excluded dates and format to match
  let excludedDatesFormatted = [];
  excludedDates.forEach((date) => {
    const localFormat = moment(date, 'DD/MM/YYYY', true).locale('en-gb').format('L');
    excludedDatesFormatted = [...excludedDatesFormatted, localFormat];
  });

  // Filter out the excluded list
  allDates = allDates.filter((date) => excludedDatesFormatted.indexOf(date.localdate) === -1);

  // Return array
  return allDates;
};


// ========================================
// Refine date format, and create element
// ========================================

const dateElement = createDateRange().map((date) => {
  const {
    price, localdate, day, state, displaydate,
  } = date;
  const formatDate = displaydate.replace(/,/g, '');
  const getDay = formatDate.substring(0, 3);
  const getMonth = formatDate.substring(4, 10);

  return `
  <li class="glide__slide">
    <button class="delivery__date ${day}" data-price="${price}" data-date="${localdate}" ${state}>
        <span class="delivery__date-dow">${getDay}</span>
        <span class="delivery__date-month">${getMonth}</span>
        <span class="delivery__date-price">£${price}</span>
      </button>
    </li>`;
}).join('');

// Add elems to DOM
const deliveryDatesList = deliveryOptions.querySelector('.glide__slides');
deliveryDatesList.innerHTML = dateElement;

// Then mount silder
dateSlider.mount();


// ========================================
// Select Weekdays or Saturday
// ========================================

deliveryDaySelector.addEventListener('click', (e) => {
  const saturdaySelector = deliveryOptions.querySelector('#delivery__day-saturday');
  const saturdays = [...deliveryDateSelector.querySelectorAll('.delivery__date-saturday')];
  const weekdays = [...deliveryDateSelector.querySelectorAll('.delivery__date-weekday')];

  if (!e.target.matches('button')) return;
  // Remove all classes from day selector
  removeClassOnArray(deliveryDaySelector, 'button', 'active');

  // Add class to target elem selector
  e.target.classList.add('active');

  // Remove existing selected classes
  removeClassOnArray(deliveryDateSelector, 'button', 'selected');

  // Enable/Disable options

  if (saturdaySelector.classList.contains('active')) {
    enableDeliveryDates(weekdays, saturdays);

    // Does this need a rule/function?
    saturdays[0].classList.add('selected');
  } else {
    enableDeliveryDates(saturdays, weekdays);

    // Is order after 12
    setDeliveryDayOptions();
  }

  // Check current selection
  getConfirmation();
});


// ========================================
// Select a delivery date
// ========================================

deliveryDateSelector.addEventListener('click', (e) => {
  // Return if button not clicked
  if (!e.target.matches('.delivery__date')) return;

  // Remove existing selected element
  removeClassOnArray(deliveryDateSelector, '.delivery__date', 'selected');

  // Add class to target elem
  e.target.classList.add('selected');

  // Return current selection
  getConfirmation();
});


// ========================================
// Select the time of delivery
// ========================================

deliveryTimeSelector.addEventListener('click', (e) => {
  // Return if button not clicked
  if (!e.target.matches('button')) return;

  // Remove active class
  removeClassOnArray(deliveryTimeSelector, 'button', 'active');

  // Add class to target elem
  e.target.classList.add('active');

  // Return current selection
  getConfirmation();
});


// ========================================
// Set some defaults ???
// ========================================

// Set default price attr
setDynamicDeliveryPrice();

// Is order after 12
setDeliveryDayOptions();

// Get current selection
getConfirmation();
