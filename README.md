# Barnes Focus

This repository contains the code for The Barnes Foundation digital guide — Barnes Focus.

## Technology Stack

- NodeJS/Express for the server and API functionality
- React for the client-side interaction
- Configured for deployment on AWS Lambda
- PostgreSQL for caching artworks locally and persisting user session information
- Node v14.5.0

## Local Development

To develop this application locally, follow these steps

1. Switch to the correct version of Node with `nvm use` or `nvm use 14.5.0`.
2. Run `npm ci` to install the needed node modules
3. Create a `.env` file and populate with values as specified by [.env-template](.env-template)
  a. Make sure to populate the DATABASE_URL with the correct database credentials
4. Run `make init-dev` to initialize your local environment. This will  
  a. Compile the server code
  b. Create the required tables for your local database schema and create the database if one does not already exist
  c. Seed your local translations table with our stored translations data
  d. Run the ElasticSearch sync to retrieve artworks information and cache it locally
5. Run `npm run dev` to start the server. This will also compile and reload the server code following any changes to the code in the [server](server) directory
6. Run `npm run start` to start the React code and hot reload

### Service Configuration

To deploy this application, you'll need to 

1. Configure an AWS Remote Database Service instance on the PostgreSQL platform. You'll need to create the schema and tables.
2. Configure an ElasticSearch database that is populated with artwork information
3. Sign up for Catchoom account

### Deploy from Command Line

You will need to have `serverless` installed to deploy the application. To install, run `npm install -g serverless`

Once that's done, and you've correctly set your `.env` file, you can deploy using either of these two commands

- `make deploy_dev`

  Use this command to deploy to the development stage

- `make deploy_prod`

  Use this command to deploy to the production stage

Behind the scenes these two commands:

1. Compile and build the `src` and `server`	directories to the `dist` directory.
2. Rename your development `node_modules` to `dev_node_modules` as a means of saving them.
3. Install the node modules needed for production deployment.
4. Deploy the application to the specified stage environment.
5. Delete the production node modules and undoes the rename of your development modules.

## Special Exhibitions

Objects from special exhibitions can be added to the app by following these steps:

1. Add a reference image for each object to [craftar](https://my.craftar.net/accounts/login/) and use the prefix `SPEX/` in the item name to denote that the object is part of a special exibition, eg: `SPEX/MOD-3-1-1`.

<!-- TODO write more instructions as things are implemented -->