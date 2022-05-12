import serverlessHTTP from "serverless-http";
import { APIGatewayEvent, Context } from "aws-lambda";
import app from "./app";

// Set up the handler wrapping the app
const handler = serverlessHTTP(app);

module.exports.server = async (event: APIGatewayEvent, context: Context) => {
  // Handler will pass the event and context to the app server
  return await handler(event, context);
};
