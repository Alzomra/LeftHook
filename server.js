const express = require('express')
const secureCompare = require("secure-compare")
const psList = require('ps-list')
var exec = require('child_process').exec , child
const {spawn} = require('child_process')
const crypto = require('crypto');


const app = express()
app.use(express.urlencoded({
    extended : true
}));
app.use(express.json());
const port = 4567

var bots = process.env.BOTS.split(":")
bots.forEach(bot => {
    try {
        exec(`git clone https://${process.env.MAIN_TOKEN}:x-oauth-basic@github.com/Alzomra/${bot} ~/webhooks/${bot}`,
        (error, stdout, stderr)=> {
            if(error === null){
                console.log(`Successfully Cloned ${bot}`)
                exec(`cd ~/Desktop/Github/${bot}; python3 ${bot}.py`, (error, stdout, stderr)=> {
                    console.log(`Successfully Restarted ${bot}`)
                    console.log(stdout)
                    console.log(stderr)
                });
            }else{
                console.log("A problem occured." , error)
            }
        }); 
    }catch(error){
        console.log(error)
    }
    
})



child = (bot)=> {exec(`cd ~/webhooks/${bot}; git pull https://Alzomra:${process.env.MAIN_TOKEN}@github.com/Alzomra/${bot}`,
function (error, stdout, stderr) {
    if (error !== null) {
         console.log('exec error: ' + error);
    }else{
        console.log(error)
    }
});
}

var generateHash = (req) => 'sha256='+ crypto.createHmac('sha256',`${process.env.SECRET_TOKEN}`).update(JSON.stringify(req.body)).digest('hex')

var respawn = (item , req) => {
    console.log(`python3 ${req.body.repository.name}.py`)
    exec(`kill 9 ${item.pid}`,
    (error, stdout, stderr)=> {
        exec(`cd ~/Desktop/Github/${req.body.repository.name}; python3 Praccforces.py`, (error, stdout, stderr)=> {
            console.log(`Successfully Restarted ${req.body.repository.name}`)
            console.log(stdout)
            console.log(stderr)
        });
    });
}

app.post(`/payload` , (req,res)=>{
    if (secureCompare(generateHash(req) , req.headers['x-hub-signature-256'])){
        console.log(req.body.head_commit.modified)
        try{
            child(req.body.repository.name)
        }catch(error){
            console.log(error)
        }
        if (req.body.head_commit.modified.includes(`${req.body.repository.name}.py`)){
            psList().then(res =>{
                res.forEach(item => {
                    if (item.cmd.includes(`${req.body.repository.name}.py`)){
                        console.log(item)
                        respawn(item , req)
                    }
                });
            });
        }
    }
});


app.listen(port , ()=>{
    console.log("Hooking some webs")
});