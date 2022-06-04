import { ElasticSearchService } from "../services";

class ElasticSearchSyncJob {
  public static async main() {
    const totalRecords = await ElasticSearchService.getTotalCount();
    console.log(
      `There are a total of ${totalRecords} in the ElasticSearch server`
    );

    const recordBatchSize = 500;
    const numberOfBatches = Math.ceil(totalRecords / recordBatchSize);
    console.log(
      `Job will process ${recordBatchSize} in ${numberOfBatches} batches `
    );

    for (let i = 0; i < numberOfBatches; i++) {
      const offset = i * 500;
      const records = await ElasticSearchService.getRecords(
        offset,
        recordBatchSize
      );
    }

    console.log(`Finished caching ${totalRecords} from ElasticSearch`);
  }
}

export default ElasticSearchSyncJob;
