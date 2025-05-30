var request = require("axios");

var defaults = require("lodash/defaults");
var assign = require("lodash/assign");

var Query = require("./query");
var formatter = require("./formatter");
const qs = require("qs");

/**
 * The main client class.
 */
var SparqlClient = (module.exports = function SparqlClient(endpoint, options) {
  var requestDefaults = {
    url: endpoint,
    method: "POST",
    encoding: "utf8",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/sparql-results+json,application/json",
      "User-Agent": "node-sparql-client/" + require("../package.json").version,
    },
  };
  var defaultParameters = {
    format: "application/sparql-results+json",
    "content-type": "application/sparql-results+json",
  };

  if (options && options.requestDefaults) {
    assign(requestDefaults, options.requestDefaults);
  }
  if (options && options.defaultParameters) {
    assign(defaultParameters, options.defaultParameters);
  }
  this.defaults = requestDefaults;
  var updateEndpoint = endpoint;
  if (options && options.updateEndpoint) {
    updateEndpoint = options.updateEndpoint;
    delete options.updateEndpoint;
  }

  var that = this;

  var sparqlRequest = async function sparqlRequest(query, queryOptions) {
    var requestOptions = query.isUpdate
      ? { form: { update: query.text }, url: updateEndpoint }
      : { form: { query: query.text } };
    defaults(requestOptions.form, defaultParameters);
    let url;
    if (!requestOptions.url) {
      url = this.defaults.url;
    } else {
      url = requestOptions.url;
    }
    let options = {
      method: this.defaults.method,
      url: url,
      data: qs.stringify(requestOptions.form), //formurlencoded(config),
      json: true,
      headers: this.defaults.headers,
    };
    try {
      responseBody = await request(options);
      if (queryOptions) {
        formatter.format(responseBody, queryOptions);
      }
      return responseBody;
    } catch (err) {
      throw err;

      return err;
    }
  };

  this.defaultParameters = defaultParameters;
  this.requestDefaults = assign(requestDefaults, options);
  this.sparqlRequest = sparqlRequest;

  /* PREFIX xyz: <...> and BASE <...> stuff: */
  this.prefixes = Object.create(null);
});

/* SparqlClient uses #register() and #registerCommon. */
SparqlClient.prototype = Object.create(require("./registerable"));

SparqlClient.prototype.query = function query(userQuery, callback) {
  var statement = new Query(this, userQuery, {
    prefixes: this.prefixes,
  });

  if (callback) {
    return statement.execute(callback);
  } else {
    return statement;
  }
};
