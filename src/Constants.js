const IN_PRODUCTION = !!document.head.querySelector('[name="csrf-token"]');
const BASE_URI = IN_PRODUCTION ? 'https://bitsy.pro/api' : 'http://localhost:3005/api';

const CONSTANTS = {
  BITS_PATH: BASE_URI + '/bits',
  BITS_SEARCH_PATH: BASE_URI + '/bits/search',
  USER_SHOW_PATH: BASE_URI + '/users/show',
  IN_PRODUCTION: IN_PRODUCTION
};

export default CONSTANTS;