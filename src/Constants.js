const BASE_URI = 'http://localhost:3005/api';

const CONSTANTS = {
  BITS_PATH: BASE_URI + '/bits',
  BITS_SEARCH_PATH: BASE_URI + '/bits/search',
  IN_PRODUCTION: !!document.getElementById('auth_token')
};

export default CONSTANTS;