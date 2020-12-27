const express = require('express');
const app = express();
const fetch = require('node-fetch');
const APIKEY = 'RGAPI-75d177c5-4d09-474c-8ab3-84026942789a';
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
    con.query('CREATE TABLE IF NOT EXISTS summoners (id varchar(47), accountid varchar(47), profileiconid int, summonername varchar(16), summonerlevel int, wins int, losses int, winrate float, sumRank varchar(255), lastChecked int);', function(error, result, fields) {
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
  });

  
app.get('/api/summoner/:name', async (request, response) => { // Returns ID and account info to client

    let name = request.params.name;
    // SQL Solution
    con.query('SELECT * FROM summoners WHERE summonername = \'' + name + '\';', async function(error, result, fields) {
        if (result.length == 0) {
            console.log("Returning " + name + " to client from RIOT");
            const fetch_response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ encodeURIComponent(name) + '?api_key=' + APIKEY);
            const data = await fetch_response.json();
            response.send(data);
        } else {
            var obj = new Object();
            obj.id = result[0].id;
            obj.profileIconId  = result[0].profileiconid;
            obj.name = name;
            // obj.summonerLevel = ; TBD
            var jsonString= JSON.stringify(obj);
            response.send(jsonString);
        }
    });
})

app.get('/api/ranked/:id',async (request, response) => { // Returns info about requested summoner to client
    const id = request.params.id;
    var playerValue = {isHot: false,isVeteran: false, isInactive: false,totalMastery: 0,winRate: 0.0,currentRank: "Iron IV"};
    
    
    const mastery_response = await fetch('https://na1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/'+ id + '?api_key=' + APIKEY);
    const mastery_data = await mastery_response.json();

    //let wins = parseInt(ranked_data[0].wins);
    //let losses = parseInt(ranked_data[0].losses);

    con.query('USE main;');

    //console.log("Checking if " + ranked_data[0].summonerName + " exists in the DB");
    con.query('SELECT * FROM summoners WHERE id = \'' + id + '\';', async function(error, result, fields) {
        if (error) throw error;
        if (result.length != 0) { // Data of summoner already exists in DB.
            if (Math.floor(new Date().getTime()/1000.0) >= result[0].lastChecked + 3000) { // Data of summoner has not been updated in more than 5 min. Update DB.

                const ranked_response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id +'?api_key=' + APIKEY);
                const ranked_data = await ranked_response.json();
                let fetch_response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ encodeURIComponent(ranked_data[0].summonerName) + '?api_key=' + APIKEY);
                let basic_data= await fetch_response.json();
                
                console.log(result[0].summonername + " exists in DB, but hasn't been updated in over 5 min... UPDATING.");
                con.query('UPDATE summoners SET lastChecked = ' + Math.floor(new Date().getTime()/1000.0) + ' WHERE id = \'' + id + '\';');
                con.query('UPDATE summoners SET sumRank = \'' + ranked_data[0].tier + " " + ranked_data[0].rank + '\' WHERE id = \'' + id + '\';');
                con.query('UPDATE summoners SET profileiconid = \'' + basic_data.profileIconId + '\' WHERE id = \'' + id + '\';');
            } else { // Data of summoner already has been updated recently.
                console.log(result[0].summonername + " exists in DB and has been recently updated within the past 5 min.")
            }
        } else { // Data of summoner is not found, new entry into DB.
            const ranked_response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id +'?api_key=' + APIKEY);
            const ranked_data = await ranked_response.json();
            let fetch_response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ encodeURIComponent(ranked_data[0].summonerName) + '?api_key=' + APIKEY);
            let basic_data = await fetch_response.json();

  
            console.log("Writing " + ranked_data[0].summonerName + " into DB");
            con.query('INSERT INTO summoners (id, summonername, winrate, sumRank, lastChecked, profileiconid) VALUES (\'' + 
            id + '\', \'' + ranked_data[0].summonerName +'\', ' + ((ranked_data[0].wins/(ranked_data[0].wins+ranked_data[0].losses))).toFixed(3) + ', \'' + ranked_data[0].tier + " " + ranked_data[0].rank +
            '\','  + Math.floor(new Date().getTime()/1000.0) + ', ' + basic_data.profileIconId + ');');
            con.query('INSERT INTO summoners (wins, losses) VALUES (' + ranked_data[0].wins + ', ' + ranked_data[0].losses + ');');
        }

        con.query('SELECT * FROM summoners WHERE id = \'' + id + '\';', function(error, result, fields) { // Finally send data back to client from DB table.
            if (result.length != 0) {
                var obj = new Object();
                obj.id = result[0].id;
                obj.profileIconId  = result[0].profileiconid;
                obj.name = result[0].summonername;
                obj.winrate = result[0].winrate;
                obj.rank = result[0].sumRank;
                var jsonString= JSON.stringify(obj);
                response.send(jsonString);
            } else {
                console.log("CANT SEND DATA BACK TO CLIENT");
            }
            
        });
    });

    
    
    
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

    response.send(matchHistory_data);
})

app.listen(port, () => console.log('listenting at 3000'));

