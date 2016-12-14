function checkStatus(response, failHandler) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  else {
    var error = new Error(response.statusText)
    error.response = response

    if (failHandler)
      failHandler()

    throw error
  }
}

function parseJSON(response) {
  return response.json();
}

function fetchWithSession(uri, options={}) {
  var sessionObj = { credentials: 'include' };
  var mergedOptions = Object.assign(sessionObj, options);

  return fetch(uri, mergedOptions);
}

module.exports = {
  checkStatus: checkStatus,
  parseJSON: parseJSON,
  fetchWithSession: fetchWithSession
}