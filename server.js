const koa = require('koa')
const crypto = require('crypto')
const shell = require('shelljs')
const config = require('./config')
const {bodyParser} = require("@koa/bodyparser");

require('dotenv').config()

const app = new koa()
app.use(bodyParser())
const port = process.env.PORT

app.use((ctx)=>{
    const hashPrefix = 'sha256'
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
        let repoConfig = config[ctx.request.body.repository.html_url]
        shell.cd(repoConfig.directory)
        shell.exec(repoConfig.scriptPath)
        ctx.response.body = {message : "Webhook triggered"}
    }

})


app.listen(port , ()=>{
    console.log("Hooking some webs" , port)
});