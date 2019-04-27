/**
 * Pirple - NodeJs Master Class Assignment #1
 * By Paulo Barbeiro
 * 
 */

const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

/**
 * Function to extend response object, and keep coherence among all
 * API responses.
 * @param status
 * @param payload
 */
function sendResponse(status, payload) {
  const responseShape = {
    status,
    message: status === 200 ? 'success' : 'failure',
    data: payload,
  };
  this.setHeader('status', status);
  this.end(JSON.stringify(responseShape));
}

/**
 * Function to handle GET requests to hello route.
 * @param req
 * @param res
 */
const getHelloFunction = (req, res) => {
  res.sendResponse(200, '<h1>Hello word!</h1>');
};

/**
 * Function to handle POST request to hello route.
 * @param req
 * @param res
 */
const postHelloFunction = (req, res) => {
  console.log(req.body);
  const result = req.body
      ? {status: 200, data: '<h1>Message received!</h1>'}
      : {status: 400, data: '<h1>Message incomplete!</h1>'};
  res.sendResponse(result.status, result.data);
};

/**
 * Function to handle requests to not implemented routes.
 * @param req
 * @param res
 */
const notImplementedFunction = (req, res) => {
  res.sendResponse(501, '<h1>Not Implemented!</h1>');
};

/**
 * Router object, organizes all handler functions.
 * The keys combine method and route
 */
const router = {
  'GET-hello': getHelloFunction,
  'POST-hello': postHelloFunction,
};

// Creates the server app
const server = http.createServer( (req, res) => {
  // Parses url
  const parsedUrl = url.parse(req.url, true);

  // Get Path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get HTTP Method
  const method = req.method.toUpperCase();

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => { 
    buffer += decoder.write(data); 
  } );
  req.on('end', () => { 
    buffer += decoder.end(); 
    
    req.body = buffer;
    res.sendResponse = sendResponse;

    const composedRoute = `${method}-${trimmedPath}`;
    const chosenHandler = typeof router[composedRoute] !== 'undefined'
      ? router[composedRoute]
      : notImplementedFunction;

    // Router the request
    chosenHandler(req, res);
  });
});

// Starts the app listening in the desired port
server.listen(3000, () => {
  console.log('App ready!\nhttp://localhost:3000');
});
