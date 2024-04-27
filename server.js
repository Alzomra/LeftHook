const koa = require('koa')
const crypto = require('crypto')
const { exec, cd, test, mkdir } = require('shelljs')
const config = require('./config')
const {bodyParser} = require("@koa/bodyparser");
const { getRepoConfig, checkRepoDirectory, checkWebhookPingEvent} = require("./middleware")

require('dotenv').config()

const app = new koa()
app.use(bodyParser())
const port = process.env.PORT

app.use(checkWebhookPingEvent)

app.use((ctx,next)=>{
    const hashPrefix = 'sha256'
    console.log("MAIN", ctx.request.body)
    const reqBody = JSON.stringify(ctx.req.body) || ''
    const Hmac = crypto.createHmac(hashPrefix,`${process.env.SECRET_TOKEN}`)
    const signature = `${hashPrefix}=${Buffer.from(Hmac.update(reqBody).digest('hex'))}`
    
    const remoteSignature = Buffer.from(ctx.req.headers['x-hub-signature-256']|| '')
    const mySingature = Buffer.from(signature)

    if (remoteSignature.length !== mySingature.length){
        ctx.response.body = {message : "Webhook signature is invalid"}
        ctx.response.status = 400
        return
    }
    const signatureVerification = crypto.timingSafeEqual(remoteSignature,mySingature)

    if ( signatureVerification ){
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