const config = require('../config.js');

class EsUtils {

  compactAllTypes(graph) {
    if( graph['@graph'] ) graph = graph['@graph'];
    if( graph.node ) graph = graph.node;
    for( let node of graph ) {
      node['@type'] = this.compactTypes(node['@type']);
    }
  }

  compactTypes(types=[]) {
    return types.filter(type => {
      for( let re of config.elasticsearch.compactTypeInclude ) {
        if( type.match(re) ) return true;
      }
      return false;
    });
  }

  /**
   * @method hydrateClientMedia
   * @description copy root clientMedia entries onto graph nodes by sameAs.
   * Item docs keep clientMedia at the root, keyed by gold record @id.
   *
   * @param {Object} doc es item document
   *
   * @returns {Object} the same document
   */
  hydrateClientMedia(doc={}) {
    if( !doc.clientMedia || !Array.isArray(doc['@graph']) ) return doc;
    for( let node of doc['@graph'] ) {
      if( node.sameAs && doc.clientMedia[node.sameAs] ) {
        node.clientMedia = doc.clientMedia[node.sameAs];
      }
    }
    return doc;
  }

  singleNode(id, graph={}) {
    if( graph['@graph'] ) graph = graph['@graph'];
    if( graph.node ) graph = graph.node;
    let node = graph.find(node => node['@id'] === id);
    if( !node ) return [];
    return [node];
  }

}

module.exports = new EsUtils();
