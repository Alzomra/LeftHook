const koa = require('koa')
const crypto = require('crypto')
const { exec, cd, test, mkdir } = require('shelljs')
const config = require('./config')
const {bodyParser} = require("@koa/bodyparser");

require('dotenv').config()

const app = new koa()
app.use(bodyParser())
const port = process.env.PORT

const ReturnErrorMessage = (ctx,message) => {
    console.log(message)
    ctx.body = { message }
    ctx.status = 400
}


const getRepoConfig  = (ctx,next) => {
    if (!ctx.request.body?.repository?.html_url){
        return ReturnErrorMessage(ctx,"BAD WEBHOOK PARAM: MISSING REPOSITORY URL")
    }
    ctx.repositoryConfig = config[ctx.request.body?.repository?.html_url]
    if (!ctx.repositoryConfig)
        return ReturnErrorMessage(ctx,"CONFIG ERROR: MISSING OR WRONG REPOSITORY URL")
    
    next()
}

const checkRepoDirectory  = (ctx,next) => {
    const repoDirectory = ctx.repositoryConfig.directory
    if ( !test('-d',repoDirectory) ){
        mkdir(repoDirectory)
        cd(repoDirectory)
        exec(`git clone ${ctx.request.body?.repository?.html_url} .`)
        console.log("CLONED REPO")
    } else {
        cd(repoDirectory)
        exec("git pull")
        console.log("REPO PULLED AND SCRIPT EXECUTED")
    }
    exec(`${ctx.repositoryConfig.scriptPath}`)
    next()
}

const checkWebhookPingEvent = (ctx,next) => {
    const event = ctx.headers["x-github-event"]
    if ( !event ){
        ReturnErrorMessage(ctx,"BAD WEBHOOK TRIGGER: NOT A GITHUB EVENT")
        return
    }
    if ( event === "ping" ) 
        console.log("NEW WEBHOOK REGISTERED")
    else
    next()
}

app.use(checkWebhookPingEvent)

app.use((ctx,next)=>{
    const hashPrefix = 'sha256'
    console.log("MAIN", ctx.request.body)
    const reqBody = JSON.stringify(ctx.req.body) || ''
    const Hmac = crypto.createHmac(hashPrefix,`${process.env.SECRET_TOKEN}`)
    const signature = `${hashPrefix}=${Buffer.from(Hmac.update(reqBody).digest('hex'))}`
    
    const remoteSignature = Buffer.from(ctx.req.headers['x-hub-signature-256']|| '')
    const mySingature = Buffer.from(signature)
    // change this to != 
    if (remoteSignature.length == mySingature.length){
        ctx.response.body = {message : "Webhook signature is invalid"}
        ctx.response.status = 400
        return
    }
    // const signatureVerification = crypto.timingSafeEqual(remoteSignature,mySingature)
    if ( true ){
        next()
        console.log("FINISHED")
        ctx.response.body = {message : "Webhook triggered"}
    }

})

app.use(getRepoConfig)

app.use(checkRepoDirectory)

app.listen(port , ()=>{
    console.log("Hooking some webs" , port)
});