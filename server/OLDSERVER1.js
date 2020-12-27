const express = require('express');
const app = express();
const fetch = require('node-fetch');
const APIKEY = 'RGAPI-bb63dd41-c50d-4e3b-a97b-f2239d9408a0';
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3000;
const mysql = require('mysql');

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
    con.query('CREATE TABLE IF NOT EXISTS summoners (id varchar(47), accountId varchar(47), profileiconid int, summonername varchar(16), summonerlevel int, winrate float, sumRank varchar(255), lastChecked int);', function(error, result, fields) {
        if (err) throw error;
    });
});

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
s3 = new AWS.S3({apiVersion: '2006-03-01'});
  
app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`Hi! Server is listening on port ${port}`)
    console.log("test");
  });

  
app.get('/api/summoner/:name', async (request, response) => { // Returns ID and account info to client

    let name = request.params.name;
    
    con.query('SELECT * FROM summoners WHERE summonername = \'' + name + '\';', async function(error, result, fields) {
        console.log(result);
        if (result.length == 0) {
            const fetch_response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ encodeURIComponent(name) + '?api_key=' + APIKEY);
            const data = await fetch_response.json();
            console.log(data);
            response.send(data);
        } else {
            console.log("Returning " + name + " to client from RIOT");
            var obj = new Object();
            obj.id = result[0].id;
            obj.profileIconId  = result[0].profileiconid;
            obj.name = name;
            obj.accountId = result[0].accountId; 
            var jsonString= JSON.stringify(obj);
            response.send(jsonString);
        }
    });

})

app.get('/api/ranked/:id',async (request, response) => { // Returns info about requested summoner to client
    console.log("im here")
    const id = request.params.id;
    var playerValue = {isHot: false,isVeteran: false, isInactive: false,totalMastery: 0,winRate: 0.0,currentRank: "Iron IV"};
    
    const ranked_response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id +'?api_key=' + APIKEY);
    const ranked_data = await ranked_response.json();
    const mastery_response = await fetch('https://na1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/'+ id + '?api_key=' + APIKEY);
    const mastery_data = await mastery_response.json();

    console.log(ranked_data);
    let wins = parseInt(ranked_data[0].wins);
    let losses = parseInt(ranked_data[0].losses);


    
    if(ranked_data){
        let wins = parseInt(ranked_data[0].wins);
        let losses = parseInt(ranked_data[0].losses);
        playerValue.isHot = ranked_data[0].hotStreak;
        playerValue.isVeteran = ranked_data[0].veteran;
        playerValue.isInactive = ranked_data[0].inactive;
        playerValue.totalMastery = mastery_data;
        playerValue.winRate = ((wins/(wins+losses)));
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

    const id = request.params.id;
    const matchHistory_response = await fetch('https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/'+ id +'?beginTime='+ Math.floor(new Date().getTime()/1000.0) + '&endIndex=75&beginIndex=0&api_key='+ APIKEY);   
    const matchHistory_data = await matchHistory_response.json();
    
    if(id == undefined)
        console.log("poop fart");

    response.send(matchHistory_data);
})

app.listen(port, () => console.log('listenting at 3000'));

