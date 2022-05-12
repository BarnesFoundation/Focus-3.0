import ElasticSearch from "@elastic/elasticsearch";

import Config, { applicationConfiguration } from "../../config";

const esClient = new ElasticSearch.Client({
  cloud: {
    id: Config.elasticSearch.cloudId,
  },
  auth: {
    username: Config.elasticSearch.username,
    password: Config.elasticSearch.password,
  },
});

/** Fields we request from our ElasticSearch index */
const ES_FIELDS = [
  "id",
  "imageSecret",
  "title",
  "shortDescription",
  "people",
  "classification",
  "locations",
  "medium",
  "url",
  "invno",
  "displayDate",
  "dimensions",
  "objRightsTypeID",
  "creditLine",
  "room",
  "ensembleIndex",
  "curatorialApproval",
  "birthDate",
  "deathDate",
  "nationality",
  "culture",
  "visualDescription",
];

type ElasticSearchRecord = {
  id;
  imageSecret;
  title;
  shortDescription;
  people;
  classification;
  locations;
  medium;
  url;
  invno;
  displayDate;
  dimensions;
  objRightsTypeID;
  creditLine;
  room;
  ensembleIndex;
  curatorialApproval;
  birthDate;
  deathDate;
  nationality;
  culture;
  visualDescription;
};

class ElasticSearchService {
  public static async findAll(
    offset: number = 0,
    limit: number = 50
  ): Promise<Array<ElasticSearchRecord>> {
    const results = [];

    const esResponse = await esClient.search({
      index: applicationConfiguration.elasticSearch.collection,
      body: fetchAllQuery(offset, limit),
    });

    if (
      esResponse.body &&
      esResponse.body["hits"] &&
      esResponse.body["hits"]["hits"].length > 0
    ) {
      const onlySourceFields = esResponse.body["hits"]["hits"].map(
        (result) => result._source
      );
      results.concat(onlySourceFields);
    }

    return results;
  }

  public static async getTotalCount() {
    const esResponse = esClient.count({
      index: applicationConfiguration.elasticSearch.collection,
    });

    if (esResponse && esResponse.hasOwnProperty("count")) {
      return esResponse["count"];
    } else {
      throw Error(
        "Could not retrieve total count of records in ElasticSearch collection"
      );
    }
  }

  public static async getObject(
    objectId: number
  ): Promise<ElasticSearchRecord> {
    const esResponse = esClient.search({
      index: applicationConfiguration.elasticSearch.collection,
      body: getObjectQuery(objectId),
    });

    if (esResponse && esResponse["hits"]["hits"].length > 0) {
      return esResponse["hits"]["hits"][0]["_source"];
    }
    return null;
  }
}

function fetchAllQuery(offset: number, limit: number) {
  return {
    from: offset,
    size: limit,
    _source: [...ES_FIELDS],
    query: {
      bool: {
        filter: {
          exists: {
            field: "imageSecret",
          },
        },
      },
    },
  };
}

function getObjectQuery(objectId: number) {
  return {
    from: 0,
    size: 25,
    _source: [...ES_FIELDS],
    query: {
      bool: {
        filter: {
          exists: {
            field: "imageSecret",
          },
        },
        must: {
          match: {
            _id: objectId,
          },
        },
      },
    },
  };
}
