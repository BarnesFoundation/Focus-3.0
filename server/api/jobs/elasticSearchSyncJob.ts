import { PrismaClient } from "@prisma/client";

import { ElasticSearchService } from "../services";

const prisma = new PrismaClient();

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

      for (let j = 0; j < records.length; j++) {
        const record = records[j];
        const recordId = record.id.toString();

        const now = new Date(Date.now()).toISOString();
        const cachedRecord = await prisma.es_cached_records.findFirst({
          where: { image_id: recordId },
        });

        // If there's no record for this id, we'll cache it
        if (!cachedRecord) {
          console.info(
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
        // The `updateMany` needs to be changed to `update` when we make `image_id` a unique field
        else {
          console.info(
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
