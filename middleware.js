const { ReturnErrorMessage } = require("./error")
const { exec, cd, test, mkdir } = require('shelljs')
const config = require('./config')

exports.getRepoConfig  = (ctx,next) => {
    if (!ctx.request.body?.repository?.html_url){
        return ReturnErrorMessage(ctx,"BAD WEBHOOK PARAM: MISSING REPOSITORY URL")
    }
    ctx.repositoryConfig = config[ctx.request.body?.repository?.html_url]
    if (!ctx.repositoryConfig)
        return ReturnErrorMessage(ctx,"CONFIG ERROR: MISSING OR WRONG REPOSITORY URL")
    
    next()
}

exports.checkRepoDirectory  = (ctx,next) => {
    const repoDirectory = ctx.repositoryConfig.directory
    if ( !test('-d',repoDirectory) ){
        mkdir(repoDirectory)
        cd(repoDirectory)
        exec(`git clone ${ctx.request.body?.repository?.html_url} .`)
        console.log("CLONED REPO")
    } else {
        cd(repoDirectory)
        exec("git pull")
        console.log("REPO PULLED")
    }
    exec(`${ctx.repositoryConfig.scriptPath}`)
    console.log("SCRIPT EXECUTED")

    next()
}

exports.checkWebhookPingEvent = (ctx,next) => {
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