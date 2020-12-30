<template>

    <v-container  >          
    


        <v-row justify = "center"><h1 ma-auto class="display-4">RESULTS</h1></v-row>
                
        <v-row >
           
            <v-col cols = "6" >
                   <player-card v-for = "(player,index) in redTeam" :key = "player.Player" :summoner-name = "player.Player" :current-rank = "blueTeamStats[index].currentRank" :win-rate = "redTeamStats[index].winRate" :champion = "player.champion"></player-card>
            </v-col>

            
            <v-col cols = "6">
                   <player-card v-for = "(player,index) in blueTeam" :key = "player.Player" :summoner-name = "player.Player" :current-rank = "blueTeamStats[index].currentRank" :win-rate = "blueTeamStats[index].winRate" :champion = "player.champion"></player-card>
            </v-col>

        </v-row>



    </v-container>            
  
</template>

<script> 
import leagueAPI from "@/services/LeagueAPICaller.js"
import roleFinder from "@/services/RoleFinder.js" 
import champFinder from '@/services/ChampionFinder.js'
import PlayerCard from './PlayerCard'

export default {
     data: () => ({
         redTeam: [],
         redTeamStats: [],
         blueTeam: [],
         blueTeamStats: []
      
  }),

    components:{
        PlayerCard                
    },

    created: async function() {

        const player_account = await leagueAPI.getAccount(this.$route.params.summonerName);
        
        
        const postToDB = await fetch('/api/summoner',{ method: 'POST', headers: {'Content-Type' : 'application/json' }, body: JSON.stringify(player_account)});


        
        const currentGame = await leagueAPI.getCurrentGame(player_account.id);

        var gameParticpants = currentGame.participants;

        let start = new Date().getTime();
        for(let i = 0; i < gameParticpants.length; i++){
            const postToDB = fetch('/api/summoner',{ method: 'POST', headers: {'Content-Type' : 'application/json' }, body: JSON.stringify(await leagueAPI.getAccount(gameParticpants[i].summonerName))});
        }

        let redTeam = gameParticpants.slice(0,5);
        let blueTeam = gameParticpants.slice(5,10);

        
        // let start = new Date().getTime();
        // let r = await roleFinder.championRoles(redTeam);
        // let b = await roleFinder.championRoles(blueTeam);
        // let r_stats = await leagueAPI.getTeamRankedInfoByID(r);
        // let b_stats = await leagueAPI.getTeamRankedInfoByID(b);


        
        let r = roleFinder.championRoles(redTeam);
        let b = roleFinder.championRoles(blueTeam);
        let res1 = await r;
        let res2 = await b;
 
        let r_stats = leagueAPI.getTeamRankedInfoByID(res1);
        let b_stats = leagueAPI.getTeamRankedInfoByID(res2);
        let res3 = await r_stats;
        let res4 = await b_stats;


        console.log("time1: ");
        console.log(new Date().getTime() - start);
        this.redTeam = res1;
        this.redTeamStats =res3;
        this.blueTeam = res2;
        this.blueTeamStats =res4;
      }      
}



</script>
