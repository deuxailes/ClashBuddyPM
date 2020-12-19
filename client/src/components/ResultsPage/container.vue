<template>

    <v-container  >          
    
                    

        <v-row justify = "center"><h1 ma-auto class="display-4">RESULTS</h1></v-row>
                
        <v-row >
           
            <v-col cols = "6" >
                   <player-card v-for = "player in redTeam" :key = "player.Player" :summoner-name = "player.Player" :current-rank = "'rank'" :win-rate = wr :champion = "player.champion"></player-card>
            </v-col>

            
            <v-col cols = "6">
                   <player-card v-for = "player in blueTeam" :key = "player.Player" :summoner-name = "player.Player" :current-rank = "'rank'" :win-rate = wr :champion = "player.champion"></player-card>
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
         blueTeam: [],
         wr: "50"
      
  }),

    components:{
        PlayerCard                
    },

    created: async function() {

        const player_account = await leagueAPI.getAccount(this.$route.params.summonerName);
        const ranked_data = await leagueAPI.getRankedInfoByID(player_account.id);
        const currentGame = await leagueAPI.getCurrentGame(player_account.id);

        var gameParticpants = currentGame.participants;
        let redTeam = gameParticpants.slice(0,5);
        let blueTeam = gameParticpants.slice(5,10);

        let start = new Date().getTime();
        let r = await roleFinder.championRoles(redTeam);
        console.log("time r: ");
        console.log(new Date().getTime() - start);  



        let start1 = new Date().getTime();
        let b = await roleFinder.championRoles(blueTeam);
        console.log("time b: ");
        console.log(new Date().getTime() - start1);  




        
        console.log("total time: ");
        console.log(new Date().getTime() - start);  
        this.redTeam = r;
        this.blueTeam = b;
  
        
         
      }


}
</script>
<!--           <v-col style="background-color: blue;" v-for = "n in 10" :key= "n" cols= "5">
                <player-card/>
            </v-col>

            -->