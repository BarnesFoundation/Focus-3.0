import dotenv from "dotenv";

dotenv.config();

export enum EnvironmentStages {
  LOCAL = "LOCAL",
  DEVELOPMENT = "DEVELOPMENT",
  PRODUCTION = "PRODUCTION",
}

const EnvironmentConfiguration = {
  /** AWS Credentials for the bucket to store scanned image attempts into */
  aws: {
    s3Bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION,
  },

  /** Configuration for ElasticSearch cluster */
  elasticSearch: {
    username: process.env.ES_USERNAME,
    password: process.env.ES_PASSWORD,
    cloudId: process.env.ES_CLOUD_ID,
  },

  /** Configuration for SendGrid when used as the email provider */
  sendGrid: {
    email: process.env.SENDGRID_EMAIL,
    username: process.env.SENDGRID_USERNAME,
    password: process.env.SENDGRID_PASSWORD,
    domain: process.env.SENDGRID_DOMAIN,
    address: process.env.SENDGRID_ADDRESS,
  },

  /** Configuration for GraphCMS when used as the story content provider */
  graphCMS: {
    endpoint: process.env.GRAPHCMS_ENDPOINT,
  },

  /** Port used only for local development */
  port: process.env.PORT,

  /** Environment indicating stage for the application */
  nodeEnv: process.env.NODE_ENV!!.toUpperCase() as EnvironmentStages,

  /** URL of the server */
  assetHost: process.env.ASSET_HOST!!,

  /** Configuration regarding the user sessions */
  session: {
    secret: process.env.SESSION_SECRET,
  },

  imgix: {
    repo: process.env.IMGIX_REPO,
  },

  /** Basic authentication configuration while we need it */
  basicAuth: {
    // Basic Authentication should only be explicitly disabled
    disabled: process.env.BASIC_AUTH_DISABLED?.toLowerCase() === 'true' ? true : false,
    name: process.env.BASIC_AUTH_NAME,
    password: process.env.BASIC_AUTH_PASSWORD,
  },
};

export default EnvironmentConfiguration;

/** Helper function to check is current stage is Production */
export const isProduction =
  EnvironmentConfiguration.nodeEnv === EnvironmentStages.PRODUCTION;

/** Helper function to check is current stage is Local */
export const isLocal =
  EnvironmentConfiguration.nodeEnv === EnvironmentStages.LOCAL;

/** Helper function to check is current stage is Development */
export const isDevelopment =
  EnvironmentConfiguration.nodeEnv === EnvironmentStages.DEVELOPMENT;
