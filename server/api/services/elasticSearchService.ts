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

/** Class responsible for interacting with an ElasticSearch cluster */
export default class ElasticSearchService {
  /** Retrieves records from ElasticSearch with the provided offset and limit */
  public static async getRecords(
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
      esResponse.body["hits"]["hits"].forEach((result) =>
        results.push(result._source)
      );
    }

    return results;
  }

  /** Retrieves the total count of records available in ElasticSearch */
  public static async getTotalCount(): Promise<number> {
    const esResponse = await esClient.count({
      index: applicationConfiguration.elasticSearch.collection,
    });

    if (esResponse && esResponse.body.hasOwnProperty("count")) {
      return esResponse.body["count"];
    } else {
      throw Error(
        "Could not retrieve total count of records in ElasticSearch collection"
      );
    }
  }

  /** Retrieves a specific record from ElasticSearch as identified by the provided object id */
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

  public static async getRoomObjects(roomId: number, viewedImageIds: number[]) {
    const esResponse = esClient.search({
      index: applicationConfiguration.elasticSearch.collection,
      body: getRoomObjectQuery(roomId, viewedImageIds),
    });

    if (esResponse && esResponse["hits"]["hits"].length > 0) {
      return esResponse["hits"]["hits"];
    }
    return [];
  }
}

function getRoomObjectQuery(roomId: number, viewedImageIds: number[]) {
  // The image id's we retrieve shouldn't match ones already seen
  const shouldNotMatchList = viewedImageIds.map((imageId) => ({
    match: { _id: imageId },
  }));

  const query = {
    from: 0,
    size: 3,
    query: {
      bool: {
        filter: {
          ...filterForImageSecret,
          // The room must matched the provided room id
          must: {
            match: {
              room: roomId,
            },
          },
        },
        must_not: shouldNotMatchList,
      },
    },
  };

  return query;
}

function fetchAllQuery(offset: number, limit: number) {
  return {
    from: offset,
    size: limit,
    _source: [...ES_FIELDS],
    query: {
      bool: {
        filter: {
          ...filterForImageSecret,
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
          ...filterForImageSecret,
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

// Query part for filtering for records that have an image secret
const filterForImageSecret = {
  exists: {
    field: "imageSecret",
  },
};
