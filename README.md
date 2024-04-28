![alt text](https://raw.githubusercontent.com/Alzomra/LeftHook/Jenkins-test/New%20Project.jpg?token=GHSAT0AAAAAACQW4R4LRPAODPPFFIH24GD4ZRO4ANQ)

# LeftHook
 A lightweight Node.js handler for GitHub webhooks.

# Ngrok setupe

    Download Ngrok executable 

    Setup a ngrok tunnel to localhost (this tunnel will recieve the github webhooks)

    ./ngrok http PORT_NUMBER

    Setup config file to specify server port number , directory to istall the repo to (you can disable repo cloning if it already exits) , and file name to execute.
