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

    con.query('SELECT * FROM summoners WHERE summonername = \'' + name + '\';', async function(error, result, fields) {
        if (result.length == 0) {
            console.log("Returning " + name + " to client from RIOT");
            const fetch_response = await fetch('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/'+ encodeURIComponent(name) + '?api_key=' + APIKEY);
            const data = await fetch_response.json();
            response.send(data);
            console.log("HIIIII");
            console.log(data);
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