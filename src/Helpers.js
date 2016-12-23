import constants from './constants';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  else {
    let error = new Error(response.statusText);
    error.response = response;

    throw error
  }
}

function parseJSON(response) {
  return response.json();
}

// Attempts to retrieve the authentication token from the DOM. If it finds it,
// returns the token value. Else, returns an empty string.
function getAuthToken() {
  let tokenElem = document.head.querySelector('[name="csrf-token"]');

  if (tokenElem)
    return tokenElem.content;
  else
    return '';
}

// Initiates a fetch, including session information.
function _fetchWithSession(uri, options={}) {
  // If we're in production, we'll use 'same-origin' as the fetch 'credentials'
  // option as we won't be making a CORS request. If we're in development mode,
  // we will be, so use 'include'.
  let credentials = constants.IN_PRODUCTION ? 'same-origin' : 'include';

  // Create an object containing the 'credentials' option for fetch.
  let credObj = { credentials: credentials };

  // Merge the credentials option in with the existing options.
  let mergedOptions = Object.assign({}, credObj, options);

  // Fetch
  return fetch(uri, mergedOptions);
}

// Initiates a GET fetch, including cookies with the request.
function getFetch(uri) {
  return _fetchWithSession(uri);
}

// Initiates a non-GET fetch, including the Rails authenticity token with the
// request and converting the body into stringified JSON. Also sets the
// appropriate content-type headers.
function fetchWithTokenAsJson(uri, options={}) {
  // Retrieve the authenticity token from the DOM. If it can't be found, it
  // will just be empty. This will only be true in development mode, where we
  // have Rails' token checking turned off.
  let authToken = getAuthToken();

  // Initialize a body var to either the current body if specified or an empty
  // object.
  let body = options.body || {};

  // Merge the authenticity token in with the body, and JSON stringify it.
  options.body = JSON.stringify(
                   Object.assign({ authenticity_token: authToken }, body)
                 );

  // Set headers to ensure the server knows we're sending JSON.
  options.headers = options.headers || {};
  options.headers['Content-Type'] = 'application/json';

  // Fetch.
  return _fetchWithSession(uri, options);
}

// Returns the time since a date in words.
function timeSince(date) {
  if (typeof date !== 'object')
    date = new Date(date);

  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 30)
    return 'just now';
  else if (seconds < 60)
    return 'less than a minute ago';

  let intervalType;

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    intervalType = 'year';
  } else {
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      intervalType = 'month';
    } else {
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) {
        intervalType = 'day';
      } else {
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
          intervalType = 'hour';
        } else {
          interval = Math.floor(seconds / 60);
          if (interval >= 1) {
            intervalType = 'minute';
          } else {
            interval = seconds;
            intervalType = 'second';
          }
        }
      }
    }
  }

  if (interval > 1 || interval === 0)
    intervalType += 's';

  return interval + ' ' + intervalType + ' ago';
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

module.exports = {
  checkStatus: checkStatus,
  parseJSON: parseJSON,
  getFetch: getFetch,
  fetchWithTokenAsJson: fetchWithTokenAsJson,
  timeSince: timeSince,
  isMobile: isMobile
}