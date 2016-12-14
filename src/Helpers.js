function checkStatus(response, failHandler) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  else {
    let error = new Error(response.statusText)
    error.response = response

    if (failHandler)
      failHandler()

    throw error
  }
}

function parseJSON(response) {
  return response.json();
}

// Performs a fetch, including session data and an auth token for Rails
function fetchWithSession(uri, options={}) {
  // Attempt to find the auth token hidden input
  let authToken = document.getElementById('auth_token'),
      // We'll tell fetch to include cookies
      credObj = { credentials: 'include' };

  // If we don't have an auth token (this will only be true in dev mode)
  if (!authToken) {
    // If a body has been given,
    if (options.body)
      // Stringify the body, since it will have been passed in as a JS object
      // to allow for potential modification
      options.body = JSON.stringify(options.body);

    // Merge our session into the passed-in options
    let mergedOptions = Object.assign(credObj, options);

    // Fetch with the merged options and return
    return fetch(uri, mergedOptions);
  }

  // Grab the token value
  let tokenValue = authToken.value;

  // If we were passed in a body, it should be in object form. We'll merge in
  // the auth token and JSON stringify it
  if (options.body)
    // Merge the authenticity token in with the body, and JSON stringify it
    options.body = JSON.stringify(Object.assign({ authenticity_token: tokenValue },
                                                options.body));
  // If we weren't given a body, and a method has been specified (meaning it's
  // a non-GET request)
  else if (!options.body && options.method) {
    // Set the auth token in the body, and set the headers so the server knows
    // we're sending JSON.
    options.body = JSON.stringify({ authenticity_token: tokenValue });
    options.headers = { 'Content-Type': 'application/json' };
  }

  // Merge everything together, replacing the old body with the new
  let mergedOptions = Object.assign(credObj, options);

  // Fetch
  return fetch(uri, mergedOptions);
}

module.exports = {
  checkStatus: checkStatus,
  parseJSON: parseJSON,
  fetchWithSession: fetchWithSession
}