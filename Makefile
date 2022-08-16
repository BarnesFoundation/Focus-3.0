# Starts a local ngrok tunnel
# connected to the React FE on localhost:3006
ngrok:
	npx ngrok http 3006 --host-header=localhost:3006

# Manually copy email views to the dist folder
# TODO - this should be more automated if possible
# as in, this command should be run whenever
# changes to the source `./server/api/views` are made
# then the source files should immediately be copied over to `dist`
views:
	cp -r ./server/api/views dist/server/api

init: 
	echo "Compiling backend server code 🔨"
	npm run build-server
	echo "Populating database schema 💾"
	npx prisma migrate dev
	echo "Seeding database with stored language translations 🌐"
	npx prisma db seed
	echo "Running ElasticSearch Sync Job to pull artwork records 🎨"
	node -e 'require("./dist/server/api/jobs/elasticSearchSyncJob.js").main()'