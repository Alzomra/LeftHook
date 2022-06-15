const koa = require('koa')
const psList = require('ps-list')
const crypto = require('crypto')
require('dotenv').config()

var exec = require('child_process').exec , child
const {spawn} = require('child_process')



const app = new koa()
const port = 4567

var repos = process.env.REPOS.split(":")
var entrys = process.env.ENTRYS.split(":")
const username = process.env.GITHUBUSERNAME
const mainToken = process.env.GITHUBTOKEN
console.log(username)
/* repos.forEach((repo,index)=> {
    try {
        exec(`git clone https://oauth2:${mainToken}@github.com/${username}/${repo}.git ./webhooks/${repo}`,
        (error, stdout, stderr)=> {
            if(error === null){
                console.log(`Successfully Cloned ${repo}`)

            }else{
                console.log("A problem occured." , error)
            }
        }); 
    }catch(error){
        console.log(error)
    }
    console.log
    exec(`chmod +x ~/webhooks/${repo}/${entrys[index]}; ./${entrys[index]}`, (error, stdout, stderr)=> {
        console.log(`Successfully Restarted ${repo}`)
        console.log(stdout)
        console.log(stderr)
    });
}) */



child = (repo)=> {exec(`cd ~/webhooks/${repo}; git pull https://${username}:${mainToken}@github.com/${username}/${repo}`,
function (error, stdout, stderr) {
    if (error !== null) {
         console.log('exec error: ' + error);
    }else{
        console.log(error)
    }
});
}


var respawn = (item,entry , req) => {
    console.log(`./${entry}`)
    exec(`kill 9 ${item.pid}`,
    (error, stdout, stderr)=> {
        exec(`cd ~/webhooks/${req.body.repository.name}; ./${entry}`, (error, stdout, stderr)=> {
            console.log(`Successfully Restarted ${entry}`)
            console.log(stdout)
            console.log(stderr)
        });
    });
}

app.use((req,res)=>{
    const hashPrefix = 'sha256'
    const reqBody = JSON.stringify(req.body) || ''
    const Hmac = crypto.createHmac(hashPrefix,`${process.env.SECRET_TOKEN}`)
    const signature = `${hashPrefix}=${Buffer.from(Hmac.update(reqBody).digest('hex'))}`

    const remoteSignature = Buffer.from(req.headers['x-hub-signature-256']|| '')
    const mySingature = Buffer.from(signature)

    if (crypto.timingSafeEqual(remoteSignature,mySingature)){
        console.log(req.body.head_commit.modified)
        try{
            //child(req.body.repository.name)
        }catch(error){
            console.log(error)
        }
        entrys.forEach((entry,index) => {
            if (req.body.head_commit.modified.includes(`${entry}`)){
                psList().then(res =>{
                    res.forEach(item => {
                        if (item.cmd.includes(`${entry}`)){
                            console.log(item)
                            //respawn(item , entry,req)
                        }
                    });
                });
            }
        })
    }
})


app.listen(port , ()=>{
    console.log("Hooking some webs")
});