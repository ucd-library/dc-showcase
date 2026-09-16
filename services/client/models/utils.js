const {logger} = require('../lib/logger');

class ControllerUtils {

  errorResponse(e, message) {
    logger.error(e);
    let details = this.errorToDetails(e);
    return {
      error: true, 
      message, details
    }
  }

  errorToDetails(e) {
    return {
      message : e.message,
      details : e.details,
      stack : e.stack
    }
  }

  /*
  * @method appendJsonLdToArray
  * @description utility to extract string values from json-ld property
  * @param {any} property json-ld property
  * @param {Array} appendToArray array to append string values to
  */ 
  appendJsonLdToArray(property, appendToArray) {
    if( !property ) return;
    
    if( typeof property === 'string' ) {
      appendToArray.push(property);
    } else {
      if( !Array.isArray(property) ) property = [property];
      for( let p of property ) {
        if( typeof p === 'string' ) {
          appendToArray.push(p);
        } else if( p.name ) {
          appendToArray.push(p.name);
        }
      }
    }
  }

}

module.exports = new ControllerUtils();