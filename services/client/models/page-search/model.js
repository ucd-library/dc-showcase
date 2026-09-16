const EsDataModel = require("../../lib/es-model.js");
const schema = require("./schema.json");
const { parseString } = require("xml2js");

class PageSearch extends EsDataModel {
  constructor() {
    super("page-search");
    this.schema = schema;
  }

  /**
   * @description search using the ucd dams search document format.
   *
   * @param {Object} searchDocument
   *
   * @returns {Promise} resolves to search result
   */
  async search(searchDocument, index) {
    if (!index) index = this.readIndexAlias;

    let id = searchDocument.id;
    let query = {
      bool: {
        must: [
          {
            multi_match: {
              query: searchDocument.text,
              fields: "@graph.content",
            },
          },
          {
            bool: {
              should: [
                { term: { "@graph.identifier": id } },
                { term: { "@graph.@id": id } },
                { term: { "@graph.encodesCreativeWork": id } },
                { term: { "@id": id } },
              ],
            },
          },
        ],
      },
    };

    let results = await this.esSearch(
      {
        from: 0,
        size: searchDocument.limit || 100,
        sort: searchDocument.sort || "_score",
        query,
        highlight: {
          fields: {
            "@graph.content": {},
          },
        },
      },
      {},
      index
    );

    return results.hits.hits.map((item) => {
      item._source.highlight = item.highlight;
      return item._source;
    });
  }

  async iaSearch(searchDocument, index) {
    if (!searchDocument.limit) searchDocument.limit = 5000;
    let results = await this.search(searchDocument, index);
    let transformedResults = [];

    for (let result of results) {
      (await this.iaSearchResultTransform(result)).forEach((word) =>
        transformedResults.push(word)
      );
    }

    return {
      ia: searchDocument.id,
      q: searchDocument.text,
      indexed: true,
      matches: transformedResults,
    };
  }

  iaSearchResultTransform(result) {
    return new Promise((resolve, reject) => {
      let terms = new Set();
      for (let key in result.highlight) {
        for (let match of result.highlight[key]) {
          (match.match(/<em>(.*)<\/em>/g) || [])
            .map((word) => word.replace(/<\/?em>/g, ""))
            .forEach((word) => terms.add(word));
        }
      }

      let matchWords = Array.from(terms).map((term) => new RegExp(term));

      let node = result["@graph"][0];
      parseString(node.content, (error, result) => {
        let words = [];

        let pageData = {
          width: parseInt(result?.OBJECT?.$?.width),
          height: parseInt(result?.OBJECT?.$?.height),
          page: parseInt(node.position),
        };

        result?.OBJECT?.HIDDENTEXT?.forEach((item) => {
          item?.PAGECOLUMN?.forEach((column) => {
            column?.REGION?.forEach((region) => {
              region?.PARAGRAPH?.forEach((paragraph) => {
                paragraph?.LINE?.forEach((line) => {
                  line?.WORD?.forEach((word) => {
                    if (!word._) return;

                    for (let re of matchWords) {
                      if (re.test(word._)) {
                        words.push(this.transformIaMatch(word, line, pageData));
                      }
                    }
                  });
                });
              });
            });
          });
        });

        resolve(words);
      });
    });
  }

  transformIaMatch(word, line, pageData) {
    let text = line.WORD.map((item) => {
      if (!item._) return "";
      if (item._ === word._) return `{{{${item._}}}}`;
      return item._;
    }).join(" ");

    let [left, bottom, right, top] = word.$.coords
      .split(",")
      .map((item) => parseInt(item));
    let padding = 8;

    return {
      text,
      par: [
        {
          l: left - padding,
          t: top - padding,
          r: right + padding,
          b: bottom + padding,
          page: pageData.page,
          boxes: [
            {
              l: left - padding,
              t: top - padding,
              r: right + padding,
              b: bottom + padding,
              page: pageData.page,
            },
          ],
          page_width: pageData.width,
          page_height: pageData.height,
        },
      ],
    };
  }

  async get(id, opts={}, index) {
    if (!index) index = this.readIndexAlias;
    id = id.replace(/\/fcr:metadata$/, '');

    let result = await this.esSearch({
        from: 0,
        size: 1,
        query: {
          bool : {
            must : [
              {term: {'@graph.@id': id}}
            ]
          }
        }
      },
      {},
      index
    );

    if( result.hits.total.value >= 1 ) {
      result = result.hits.hits[0]._source;
    } else {
      return null;
    }

    return result;
  }

  getDefaultIndexConfig(schema) {
    let indexConfig = super.getDefaultIndexConfig(schema);
    let analysis = indexConfig.body.settings.analysis;
    if (!analysis.filter) analysis.filter = {};
    if (!analysis.char_filter) analysis.char_filter = {};
    if (!analysis.analyzer) analysis.analyzer = {};

    analysis.char_filter.djvu_xml = {
      type: "pattern_replace",
      pattern: "<[^>]*>",
      replacement: "",
      flags: "CASE_INSENSITIVE",
    };

    analysis.filter.djvu_xml = {
      type: "stop",
      ignore_case: true,
      stopwords: [
        "_english_",
        "xml",
        "object",
        "param",
        "hiddentext",
        "pagecolumn",
        "region",
        "paragraph",
        "line",
        "word",
      ],
    };

    analysis.analyzer.djvu_xml = {
      type: "stop",
      char_filter: ["djvu_xml"],
      filter: ["lowercase", "stop"],
    };

    return indexConfig;
  }
}

module.exports = new PageSearch();
