//ssh -i convertedkeypair.pem -L 9229:localhost:9229 ec2-user@ec2-107-23-74-62.compute-1.amazonaws.com
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const APIKEY = 'RGAPI-e469bcc6-22d5-485e-9574-2f7f6a8415ad';
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3000;
const mysql = require('mysql');

var AWS = require('aws-sdk');
const { response } = require('express');
AWS.config.update({region: 'us-east-1'});
s3 = new AWS.S3({apiVersion: '2006-03-01'});
  
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`Hi! Server is listening on port ${port}`)
});

const con = mysql.createConnection({
    host: "database-1.c5sr4ubnohcj.us-east-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "4419tina"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to DB!");
    con.query('CREATE DATABASE IF NOT EXISTS main;');
    con.query('USE main;');
    con.query('CREATE TABLE IF NOT EXISTS summoners (id varchar(60), accountid varchar(60), profileiconid int, summonername varchar(16), summonerlevel int, wins int, losses int, winrate float, sumRank varchar(255), lastChecked int);', function(error, result, fields) {
        if (err) throw error;
    });
});


app.get('/api/summoner/:name', async (request, response) => { // Checks if accounnt info is already in DB and then returns ID and account info to client

    let name = request.params.name;
    // preparedStatement = prepare('SELECT * FROM summoners WHERE summonername = ?');
    // preparedStatement.setField(0, name);

    con.query('SELECT * FROM summoners WHERE summonername = ?', name ,async (error, result, field) =>{
        if(result.length === 0){
            const fetch_response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ encodeURIComponent(name) + '?api_key=' + APIKEY);
            const data = await fetch_response.json();
            console.log("account api called",data);
            response.send(data);
            
        }
        else {
            var obj = {};
            obj.name = result[0].summonername;
            obj.profileIconId  = result[0].profileiconid;
            obj.id = result[0].id;
            obj.accountId = result[0].accountid;
            obj.summonerLevel = result[0].summonerlevel;
            console.log("database called",obj);
            response.send(JSON.stringify(obj));
        }
    });


    

    // con.query(conStr,async (error,result,field) =>{
    //     if(result.length ==0){
    //         con.query( 'INSERT INTO summoners (id, accountid,summonername, summonerlevel, profileiconid,lastChecked) VALUES(?,?,?,?,?,?);',[data.id,data.accountId, name,data.summonerLevel,data.profileIconId,Math.floor(new Date().getTime()/1000.0)])
    //     }
    //     else
    //         console.log(data.id + " already exists!");
    // });


})

app.post('/api/summoner/', async(request, response) =>{ //post user to DB if its not already in
    request.setTimeout(0);
    let summoner = request.body;
    let conStr = "SELECT * FROM summoners WHERE id = \'" + summoner.id + "\';";


    con.query(conStr, async function(error, result, field) {
        if(error) throw error;

        if (result.length === 0) {

            const ranked_response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ summoner.id +'?api_key=' + APIKEY).then( data => {
                return data.json();
            }).then( async function(ranked_data) {
               
                
                    
                    
                    console.log("ranked and account api called",summoner);

                    let entries = [ summoner.id, 
                                    summoner.accountId, 
                                    summoner.profileIconId, 
                                    summoner.name, 
                                    summoner.summonerLevel, 
                                    0,
                                    0, 
                                    0,
                                    "Unranked",
                                    Math.floor(new Date().getTime()/1000.0)];

                    if(ranked_data.length > 0) {
                        entries = [ summoner.id, 
                                    summoner.accountId, 
                                    summoner.profileIconId, 
                                    summoner.name, 
                                    summoner.summonerLevel, 
                                    ranked_data[0].wins,
                                    ranked_data[0].losses, 
                                    ((ranked_data[0].wins/(ranked_data[0].wins+ranked_data[0].losses))).toFixed(3),
                                    ranked_data[0].tier + " " + ranked_data[0].rank,
                                    Math.floor(new Date().getTime()/1000.0)];
                    }

                        
                    con.query('INSERT INTO summoners (id, accountid, profileiconid, summonername, summonerlevel, wins, losses, winrate, sumRank, lastChecked) VALUES(?,?,?,?,?,?,?,?,?,?);', entries);
                    


                    
                
                
            });
        }
        else {
            console.log(summoner.id + " already exists!");
            
        }
        
    
    });
    
    response.status(200).send("HEY");   
})

app.get('/api/ranked/:id',async (request, response) => { // Returns ranked and player value info about requested summoner to client
    const id = request.params.id;

    var playerValue = {isHot: false,isVeteran: false, isInactive: false,totalMastery: 0,winRate: 0.0,currentRank: "Unranked"};
    
    const ranked_response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id +'?api_key=' + APIKEY);
    const ranked_data = await ranked_response.json();
    const mastery_response = await fetch('https://na1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/'+ id + '?api_key=' + APIKEY);
    const mastery_data = await mastery_response.json();

    console.log("ranked api called");
    
    if(ranked_data.length > 0){  
        let wins = parseInt(ranked_data[0].wins);
        let losses = parseInt(ranked_data[0].losses);
        playerValue.isHot = ranked_data[0].hotStreak;
        playerValue.isVeteran = ranked_data[0].veteran;
        playerValue.isInactive = ranked_data[0].inactive;
        playerValue.totalMastery = mastery_data;
        playerValue.winRate = ((wins/(wins+losses))).toFixed(3);
        playerValue.currentRank = ranked_data[0].tier + " " + ranked_data[0].rank;
    }


    response.send(playerValue);

    
})

app.get('/api/playerRoles',async (request,response) => {  // Returns champion role data JSON to client
    let championRates = await fetch("https://clashbuddycache.s3.amazonaws.com/championRates.json");
    let data = await championRates.json();
    response.send(data);
})


app.get('/api/currentGame/:id',async (request,response) => { // Returns currentGame info
    const id = request.params.id;
    const spectator_response = await fetch('https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/%27'+ id + '?api_key=' + APIKEY);   
    const spectator_data = await spectator_response.json();
    response.send(spectator_data);
})

app.get('/api/matchHistory/:id',async (request,response) =>{ // Sends back 75 matches to client
    let start = new Date().getTime();
    const id = request.params.id;
    const matchHistory_response = await fetch('https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/'+ id +'?beginTime='+ Math.floor(new Date().getTime()/1000.0) + '&endIndex=15&beginIndex=0&api_key='+ APIKEY);   
    const matchHistory_data = await matchHistory_response.json();
    //console.log("time2: ");
    //console.log(new Date().getTime() - start);
    response.send(matchHistory_data);
})

app.listen(port, () => console.log('listenting at 3000'));