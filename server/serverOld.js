const express = require('express');
const app = express();
const fetch = require('node-fetch');
const APIKEY = 'RGAPI-eab763fd-6716-438c-ae6f-f6c363e3fb23';
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3000;

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
    const fetch_response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ encodeURIComponent(name) + '?api_key=' + APIKEY);
    const data = await fetch_response.json();
    response.send(data);

})

app.get('/api/ranked/:id',async (request, response) => { // Returns info about requested summoner to client
    const id = request.params.id;
    var playerValue = {isHot: false,isVeteran: false, isInactive: false,totalMastery: 0,winRate: 0.0,currentRank: "Iron IV"};
    
    const ranked_response = await fetch('https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/'+ id +'?api_key=' + APIKEY);
    const ranked_data = await ranked_response.json();
    const mastery_response = await fetch('https://na1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/'+ id + '?api_key=' + APIKEY);
    const mastery_data = await mastery_response.json();

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
    let start = new Date().getTime();
    const id = request.params.id;
    const matchHistory_response = await fetch('https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/'+ id +'?beginTime='+ Math.floor(new Date().getTime()/1000.0) + '&endIndex=75&beginIndex=0&api_key='+ APIKEY);   
    const matchHistory_data = await matchHistory_response.json();
    console.log("time2: ");
    console.log(new Date().getTime() - start);
    response.send(matchHistory_data);
})

app.listen(port, () => console.log('listenting at 3000'));