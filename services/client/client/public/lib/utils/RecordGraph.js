const ClientMedia = require('./client-media/model.js');
const CHILD_LINKS = ['hasPart', 'associatedMedia', 'image'];
const PARENT_LINKS = ['isPartOf', 'encodesCreativeWork'];

class RecordGraph {

  constructor(data, opts={}) {
    this.data = data;

    this.CHILD_LINKS = CHILD_LINKS;

    this.opts = {};
    this.index = {};
    this.root = null;
    this._score = data._score;
    this.init();
  }

  init() {
    for( let item of this.data['@graph'] ) {
      item.id = item['@id'];

      // if the node id is the main data id, this is the root
      if( item['@id'] === this.data['@id'] ) {
        this.root = item;
      }

      // clean uri's from type names
      item['@shortType'] = (item['@type'] || []).map(uri => uri.replace(/.*#/, '').replace(/.*\//, ''))

      // create a quick lookup index by node URI
      this.index[item['@id']] = item;
    }

    if( this.root ) {
      this.clientMedia = new ClientMedia(this.root['@id'], this.data['@graph'], this.opts);
    }

    if( Array.isArray(this.root.name) ) {
      this.root.name = this.root.name[0];
    }
  }

  /**
   * @method getChildren
   * @description get all hasPart and associatedMedia nodes
   * 
   * @param {Object|String} nodeOrPath 
   * @returns {Array<Object>}
   */
  getChildren(nodeOrPath) {
    let children = {};
    if( !nodeOrPath ) return children;

    let container = this.getContainer(nodeOrPath);
    if( !container ) return children;

    CHILD_LINKS.forEach(prop => {
      children[prop] = [];
      this.asArray(container[prop]).forEach(item => {
        let child = this.getContainer(item);
        if( !child ) return;
        children[prop].push(child);
      });
    });


    return children;
  }

  /**
   * @method getContainer
   * @description give a string path, return the container for path.  If
   * a container is given, the container is returned.
   * 
   * @param {String|Object} nodeOrPath 
   * @returns 
   */
  getContainer(nodeOrPath) {
    if( typeof nodeOrPath === 'string' ) {
      return this.index[nodeOrPath];
    }
    return this.index[nodeOrPath['@id']];
  }

  /**
   * @method asArray
   * @description given a value of a property, return as array.  If
   * the value is undefined or null, returns empty array.
   * 
   * @param {*} val 
   * @returns {Array}
   */
  asArray(val) {
    if( val === undefined || val === null ) return [];
    if( Array.isArray(val) ) return val;
    return [val];
  }

}

module.exports = RecordGraph;