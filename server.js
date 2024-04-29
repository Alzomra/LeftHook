const koa = require('koa')
const crypto = require('crypto')
const {bodyParser} = require("@koa/bodyparser");
const { getRepoConfig, checkRepoDirectory, checkWebhookPingEvent, validateWebhook} = require("./middleware")

require('dotenv').config()

const app = new koa()
app.use(bodyParser())
const port = process.env.PORT


app.use(checkWebhookPingEvent)
app.use(getRepoConfig)
app.use(validateWebhook)

app.use((ctx,next)=>{
    const hashPrefix = 'sha256'
    const reqBody = JSON.stringify(ctx.request.body) || ''
    console.log(ctx.repositoryConfig.webhookSecret)
    const Hmac = crypto.createHmac(hashPrefix,ctx.repositoryConfig.webhookSecret)
    const signature = `${hashPrefix}=${Buffer.from(Hmac.update(reqBody).digest('hex'))}`
    
    const remoteSignature = Buffer.from(ctx.req.headers['x-hub-signature-256']|| '')
    const mySingature = Buffer.from(signature)

    if (remoteSignature.length !== mySingature.length){
        ctx.response.body = {message : "Webhook signature is invalid"}
        ctx.response.status = 400
        console.log("SIGNATURE INVALID")
        return
    }
    const signatureVerification = crypto.timingSafeEqual(remoteSignature,mySingature)
    console.log(signatureVerification)
    if ( signatureVerification ){
        next()
        console.log("FINISHED")
        ctx.response.body = {message : "Webhook triggered"}
    }
})



app.use(checkRepoDirectory)

app.listen(port , ()=>{
    console.log("Hooking some webs" , port)
});