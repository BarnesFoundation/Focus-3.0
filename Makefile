######################################
#
# Make commands for building and deployment
#
######################################

# Compiles the application and installs production node_modules
build:
	# 1. Compiles the src and server directory and outputs them to dist
	npm run build

	# 2. Rename the development node_modules
	mv node_modules dev_node_modules

	# 3. Install the production node_modules
	npm ci --production

	# 4. Generate prisma client
	# TODO - Find out if there's anyway to not hardcode the prisma version
	# and have it use the version as specified from package.json instead
	npx prisma@^3.14.0 generate

# Removes the production node_modules and undoes the rename of development node_modules
reset_node:
	rm -rf node_modules
	mv dev_node_modules node_modules

prod:
	npm run deploy:prod

dev: 
	npm run deploy:dev

dry_package: 
	npx serverless package --stage dry

# Deploy to development
deploy_dev: set_env_dev build dev reset_node

# Deploy to production
deploy_prod: set_env_prod build prod reset_node

# Test building deployment package
deploy_dry: build dry_package reset_node

# Set PUBLIC_URL for development
# TODO - Try to pull this from the environment instead of hard-coding here
# TODO - Sync built assets from `build` folder to the `build` directory in the S3 bucket
set_env_dev: 
	export PUBLIC_URL="https://focus-application-dev-serverlessdeploymentbucket-wyfkuk6n7ves.s3.amazonaws.com/build"

# Set PUBLIC_URL for production
set_env_prod: 
	export PUBLIC_URL="https://focus-application-dev-serverlessdeploymentbucket-wyfkuk6n7ves.s3.amazonaws.com/build"

######################################
#
# Make commands for local development
#
######################################

# Starts a local ngrok tunnel
# connected to the React FE on localhost:3006
ngrok-client:
	npx ngrok http 3006 --host-header=localhost:3006

# Starts a local ngrok tunnel
# connected to the Node BE on localhost:4006
ngrok-server:
	npx ngrok http 4006 --host-header=localhost:4006

# Manually copy email views to the dist folder
# TODO - this should be more automated if possible
# as in, this command should be run whenever
# changes to the source `./server/api/views` are made
# then the source files should immediately be copied over to `dist`
views:
	cp -r ./server/api/views dist/server/api

init-dev: 
	echo "Compiling backend server code 🔨"
	npm run build-server
	echo "Initialize database 🗄️"
	chmod +x bin/initdb
	bin/initdb
	echo "Populating database schema 💾"
	npx prisma migrate dev
	echo "Seeding database with stored language translations 🌐"
	npx prisma db seed
	echo "Running ElasticSearch Sync Job to pull artwork records 🎨"
	make elastic-sync
	echo "Copying over email templates to the server directory 📧"
	make views

elastic-sync:
	node -e 'require("./dist/server/api/jobs/elasticSearchSyncJob.js").main()'