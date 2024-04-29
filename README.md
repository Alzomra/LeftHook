![alt text](https://github.com/Alzomra/LeftHook/blob/assets/assets/lefthook.jpg?raw=true)
# LeftHook
 A lightweight Node.js handler for GitHub webhooks.

# Ngrok setup

    Download Ngrok executable 

    Setup a ngrok tunnel to localhost (this tunnel will recieve the github webhooks)

    ./ngrok http PORT_NUMBER

    Setup config file to specify server port number , directory to istall the repo to (you can disable repo cloning if it already exits) , and file name to execute.
