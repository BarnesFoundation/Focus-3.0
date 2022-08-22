export const batchify = async <T>(
  list: number[] | string[],
  operationToBatch: (...args: any[]) => Promise<T>,
  parallelExecutionLimit: number = 5
): Promise<Array<T>> => {
  const numberOfBatches = Math.ceil(list.length / parallelExecutionLimit);
  console.log(
    `There will be ${numberOfBatches} batches of ${parallelExecutionLimit} executions each`
  );

  let responses = [];
  for (let i = 0; i <= numberOfBatches; i++) {
    // Setup this batch
    const batchStart = i * parallelExecutionLimit;
    const batchArguments = list.slice(
      batchStart,
      batchStart + parallelExecutionLimit
    );

    const batchRequests = batchArguments.map((batchArg) => {
      return operationToBatch.apply(null, [batchArg]);
    });

    // Execute the batches of promises
    const responseSet = await Promise.all(batchRequests);
    responses = responses.concat(responseSet);
  }

  return responses;
};
