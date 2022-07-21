import axios from "axios";

class AsyncJob {
  /** The implementation of this Asynchronous Job is a bit tricky
   * In our Ruby on Rails implementation, we actively use ActiveJob/Sidekiq to define jobs
   * that have a `perform_later` function to add the job execution to the queue
   *
   * However, in our NodeJS/Lambda re-write, we may not necessarily need a queue (like SQS)
   * nor do we really need to queue jobs (these are typically not intensive long-running jobs anyway).
   *
   * Any job that needs to "perform later" should extend this class and then implement its own
   * "performLater" function, for type-safety, and then forward arguments to this "performLater"
   *
   * Since we are running on Lambda, we should in theory just be able to spawn these jobs and have these picked
   * up by any available Lambda function at that time.
   *
   * We just need to define a route handler for these jobs so that the Lambda
   * knows what job was kicked off and how to handle it. The job would then run as expected.
   *
   * The below facilitates one end of that. It creates an HTTP POST request to our own Lambda functions
   * with the data needed to run the job. This request would then be handled by our route handlers, and
   * call the appropriate job.
   *
   * A very basic job running mechanism, which should work assuming we have enough free Lambdas available
   * to handle these job executions.
   *
   * The steps to use this successfully thus are
   * 1. Create a job definition that needs to "perform later" and extends this class
   * 2. Define its "main" function, where the core logic of it is implemented
   * 3. Define its "performLater" function, where arguments for performing the job are passed to
   * 4. From that "performLater", call the "performLater" of this class with "super.performLater(...)"
   * 5. Define a route handler for that job definition and have the handler call the "main" function
   *    of the job, forwarding the arguments from the HTTP request to it
   */
  public static async performLater(...args) {
    const response = await axios({
      method: "POST",
      data: [...args],
    });

    console.log(`Received response from "performLater" request`, response.data);
  }
}

export default AsyncJob;
