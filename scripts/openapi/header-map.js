// The header map to build header objects in the schema

module.exports = {
  Allow: {
    desc: "The allowed HTTP methods on this endpoint.",
    schema: "string"
  },
  "X-Content-Type-Options": {
    desc: "Indicates the 'Content-Type' header should be followed.",
    schema: "string"
  },
  "Access-Control-Allow-Methods": {
    desc: "Indicates methods allowed in response to preflight requests.",
    schema: "string" // TODO if we rework how this is handled, we could add style info
  },
  "Access-Control-Allow-Headers": {
    desc: "Indicates headers allowed in response to preflight requests.",
    schema: "string"
  },
  "Access-Control-Allow-Origin": {
    desc: "Indicates if the response can be shared when requesting code from the given origin.",
    schema: "string"
  },
  "Access-Control-Allow-Credentials": {
    desc: "Indicates if the server allows cross-origin HTTP requests to include credentials.",
    schema: "string"
  }
};
