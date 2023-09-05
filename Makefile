######################################
#
# Make commands for building and deployment
#
######################################

# Compiles the application and installs production node_modules
build:
	# 1. Compiles the src and server directory and outputs them to dist
	npm run build

	# 2. Generate AdminJS frontend files and move them to dist where frontend assets are server from
	npm run bundles

	# 3. Rename the development node_modules
	mv node_modules dev_node_modules

	# 4. Install the production node_modules
	npm ci --production

	# 5. Generate prisma client
	# TODO - Find out if there's anyway to not hardcode the prisma version
	# and have it use the version as specified from package.json instead
	npx prisma@^3.14.0 generate

	# 6. Remove prisma unused client and unused modules to reduce node_modules size
	# TODO - Find out how to reduce node_modules size packages in a more consistent manner
	rm "./node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node"
	rm -rf "node_modules/@adminjs/design-system/node_modules/"
	rm -rf "node_modules/@types"
	rm -rf "node_modules/@babel/plugin-transform-typescript" "node_modules/@babel/plugin-transform-classes" "node_modules/@babel/plugin-transform-modules-systemjs" "node_modules/@babel/helper-wrap-function" "node_modules/@babel/polyfill" "node_modules/@babel/preset-env"
	rm "node_modules/@adminjs/design-system/bundle.development.js"
	rm "node_modules/@adminjs/design-system/bundle.production.js"
	rm -rf "node_modules/@carbon/icons-react/es"
	rm -rf "node_modules/react-datepicker/node_modules/date-fns/esm"

# Removes the production node_modules and undoes the rename of the development node_modules
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
	export PUBLIC_URL="https://focus-application-prod-serverlessdeploymentbucket-1b3ojh7lpevit.s3.amazonaws.com/build"

######################################
#
# Make commands for local development
#
######################################

# Starts a local ngrok tunnel
# connected to the React FE on localhost:3006
# Ngrok had recent breaking changes in new releases, so hardcode old version until we upgrade
ngrok-client:
	npx ngrok@4.3.0 http 3006 --host-header=localhost:3006

# Starts a local ngrok tunnel
# connected to the Node BE on localhost:4006
# Ngrok had recent breaking changes in new releases, so hardcode old version until we upgrade
ngrok-server:
	npx ngrok@4.3.0 http 4006 --host-header=localhost:4006

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