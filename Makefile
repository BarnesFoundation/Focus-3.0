# Starts a local ngrok tunnel
# connected to the React FE on localhost:3006
ngrok:
	npx ngrok http 3006 --host-header=localhost:3006