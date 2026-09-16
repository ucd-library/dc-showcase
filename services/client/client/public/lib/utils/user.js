const config = require('../config');

/**
 * @class User
 * @description wrapper around APP_CONFIG.user
 */
class User {

  constructor() {
    this.data = config.user;
    if( !this.data.roles ) this.data.roles = [];
    this.editUiAccess = ['admin', 'ui-admin'];
  }

  isLoggedIn() {
    if( this.data.loggedIn === true ) return true;
    return false;
  }

  canEditUi() {
    for( let role of this.editUiAccess ) {
      if( this.hasRole(role) ) return true;
    }
    return false;
  }

  hasRole(role) {
    return this.data.roles.includes(role);
  }
}

let user = new User();
export default user;