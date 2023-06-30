import { ElasticSearchService, DatabaseService } from "../services";

const prisma = DatabaseService.instance;

class ElasticSearchSyncJob {
  public static async main() {
    const totalRecords = await ElasticSearchService.getTotalCount();
    console.log(
      `There are a total of ${totalRecords} in the ElasticSearch server`
    );

    const recordBatchSize = 250;
    const numberOfBatches = Math.ceil(totalRecords / recordBatchSize);
    console.debug(
      `Job will process ${recordBatchSize} in ${numberOfBatches} batches `
    );

    for (let i = 0; i <= numberOfBatches; i++) {
      const offset = i * recordBatchSize;
      const records = await ElasticSearchService.getRecords(
        offset,
        recordBatchSize
      );

      for (let j = 0; j < records.length; j++) {
        const record = records[j];
        const recordId = record.id.toString();

        const now = new Date(Date.now()).toISOString();
        const cachedRecord = await prisma.es_cached_records.findFirst({
          where: { image_id: recordId },
        });

        // If there's no record for this id, we'll cache it
        if (!cachedRecord) {
          console.debug(
            `No record found for "image_id": ${record.id}. Creating new record`
          );
          await prisma.es_cached_records.create({
            data: {
              es_data: record,
              image_id: recordId,

              created_at: now,
              updated_at: now,
            },
          });
        }

        // Otherwise, we had a record for it, so let's just update the data
        // TODO - The `updateMany` needs to be changed to `update` when we make `image_id` a unique field
        else {
          console.debug(
            `Existing record found for "image_id": ${record.id}. Updating record data`
          );
          await prisma.es_cached_records.updateMany({
            where: { image_id: recordId },
            data: {
              es_data: record,

              updated_at: now,
              last_es_fetched_at: now,
            },
          });
        }
      }
    }

    console.log(`Finished caching ${totalRecords} records from ElasticSearch`);
  }
}

export default ElasticSearchSyncJob;
export const main = ElasticSearchSyncJob.main;
