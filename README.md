# LeftHook

    Lefthook is a lightweight and flexible Git webhook handler designed to streamline your development workflows.
    Whether you’re managing webhooks for continuous integration, deployment, or custom automation, Lefthook has you covered.

# Setup & Usage

## Environment variables
    
Copy the .env.example to .env and set the PORT variable to the port that you want tobe used by lefthook.

```cp .env.example .env```

## Repository config

Copy the config.example.js to config.js and configure the repositories that will be managed by lefthook.

```cp config.example.js config.js```

Make sure to provide the repository url, script path (and the webhook secret if it is set).

```        
"REPO_URL"      : The github repository URL.
"directory"     : Directory where Lefthook will clone or expect to find the repository.
"scriptPath"    : The script that will be executed on webhook trigger.
"webhookSecret" : Webhook secret if configured in the webhook config.
```

## Start lefthook

```node ./server.js```

## Local Development 
### Ngrok setup

    Download Ngrok executable 

    Setup a ngrok tunnel to localhost (this tunnel will recieve the github webhooks)

    ./ngrok http PORT_NUMBER

    Setup config file to specify server port number , directory to istall the repo to (you can disable repo cloning if it already exits) , and file name to execute.
