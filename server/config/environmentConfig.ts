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

  /** Configuration for Google related credentials */
  google: {
    projectId: process.env.GOOGLE_PROJECT_ID,
  },

  imgix: {
    repo: process.env.IMGIX_REPO,
  },
};

export default EnvironmentConfiguration;

/** Helper function to check is current stage is Production */
export const isProduction = (): boolean =>
  EnvironmentConfiguration.nodeEnv === EnvironmentStages.PRODUCTION;

/** Helper function to check is current stage is Local */
export const isLocal = (): boolean =>
  EnvironmentConfiguration.nodeEnv === EnvironmentStages.LOCAL;

/** Helper function to check is current stage is Development */
export const isDevelopment = (): boolean =>
  EnvironmentConfiguration.nodeEnv === EnvironmentStages.DEVELOPMENT;
