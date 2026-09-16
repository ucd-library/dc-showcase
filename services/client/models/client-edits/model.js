const pg = require('../../lib/pg.js');

/**
 * @class ClientEditsModel
 * @description Read-side cache of collection/item display-config edits
 * (collection hero image, watercolor theme, viewer-type overrides, etc).
 *
 * This used to also be the write path: fin's dbsync would call is()/update()
 * whenever the browser PUT JSON-LD straight to
 * /fcrepo/rest/application/ucd-lib-client/... and this model would denormalize
 * that into Postgres. Both the dbsync hooks and the fcrepo fetch are gone -
 * this is being replaced entirely by a direct JSON write API against
 * Postgres/CaskFS (see docs/PORT-PLAN.md Phase 6, which also renames this
 * model to app-config). Until that lands this is read-only.
 */
class ClientEditsModel {

  get(id) {
    if( id.match(/^\/item\//) ) {
      return this.getItemEdits(id);
    } else if( id.match(/^\/collection\//) ) {
      return this.getCollectionEdits(id);
    }
    return null;
  }

  async getItemEdits(id) {
    let resp = await pg.query(
      `SELECT * FROM dams_edits.edit WHERE item_id = $1;`,
      [id]
    );

    let edits = [];
    for( let row of resp.rows ) {
      edits = edits.concat(row.edit);
    }

    return this.cleanEditForApi(id, edits);
  }

  async getCollectionEdits(id) {
    let resp = await pg.query(
      `SELECT * FROM dams_edits.edit WHERE collection_id = $1;`,
      [id]
    );

    let itemEdits = {};
    let edits = [];

    for( let row of resp.rows ) {
      let arr = row.edit;

      if( row.item_id ) {
        if( !itemEdits[row.item_id] ) {
          itemEdits[row.item_id] = [];
        }
        itemEdits[row.item_id] = itemEdits[row.item_id].concat(arr);
      } else {
        edits = edits.concat(arr);
      }
    }

    for( let prop in itemEdits ) {
      itemEdits[prop] = this.cleanEditForApi(prop, itemEdits[prop]);
    }

    return {
      collection : this.cleanEditForApi(id, edits),
      items : itemEdits
    }
  }

  cleanEditForApi(id, edits, obj={}) {
    let nodes = edits.find(e => e['@id'].split('/fcrepo/rest/application/ucd-lib-client').pop() === id);
    if( !nodes ) return obj;

    if( !Array.isArray(nodes) ) {
      nodes = [nodes];
    }

    for( let edit of nodes ) {
      for( let prop in edit ) {
        if( prop === '@id' ) {
          obj['@id'] = edit[prop];
          try {
            obj['@id'] = new URL(obj['@id']).pathname.replace(/^\/fcrepo\/rest/, '');
          } catch(e) {}
        }

        if( !(prop.match(/^http:\/\/digital.ucdavis.edu\/schema/) ||
            prop.match(/http:\/\/schema.org/))) continue;

        let propName = prop.replace(/.*(#|\/)/, '');
        if( propName === 'isPartOf' ) continue;

        let v = edit[prop];
        if( !Array.isArray(v) ) {
          v = [v];
        }
        v = v.map(p => this.getValue(p, edits));

        if( v.length === 1 ) {
          obj[propName] = v[0];
        } else {
          obj[propName] = v;
        }
      }
    }

    return obj;
  }

  getValue(prop, edits) {
    if( typeof prop === 'string' ) {
      return prop;
    }
    if( prop['@value'] !== undefined ) {
      return prop['@value'];
    }
    if( prop['@id'] ) {
      let obj = this.cleanEditForApi(prop['@id'].split('/fcrepo/rest/application/ucd-lib-client').pop(), edits);
      if( Object.keys(obj).length === 0 ) {
        return prop;
      }
      return obj;
    }

    return prop;
  }

}

module.exports = new ClientEditsModel();
