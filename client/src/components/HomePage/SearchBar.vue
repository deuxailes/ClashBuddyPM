<template>

                <v-text-field
                    
                    v-model="summonerName"
                    :append-outer-icon = "icon"           
                    label="Summoner Name"
                    type="text"
                    @click:append-outer="searchSummoner">
                </v-text-field>

</template>


<script>
import leagueAPI from "@/services/LeagueAPICaller.js"
import roleFinder from "@/services/RoleFinder.js" 
import champFinder from '@/services/ChampionFinder.js'

export default {
    name: 'SearchBar',
    data: () => ({
        icon:'mdi mdi-magnify',
        summonerName: ''
    }),
    methods:{
            async searchSummoner() {
                const player_account = await leagueAPI.getAccount(this.summonerName);
                //const ranked_data = await leagueAPI.getRankedInfoByID(player_account.id);
                ///const currentGame = await leagueAPI.getCurrentGame(player_account.id);
                //console.log(currentGame);

                //var gameParticpants = currentGame.participants;
               // let jglerID = await roleFinder.championRoles(gameParticpants);
                 //console.log(await champFinder.getChampionByKey(jglerID));
                console.log(player_account.id);
                if (player_account.id != null) {
                    console.log("HIII " + encodeURIComponent(player_account.name));
                    var url = "/#/results/summoner/" + encodeURIComponent(player_account.name);
                    window.location.href = url;
                }
                else {
                    console.log("SUMMONER NOT FOUND");
                }

               
            }
    }   
    


}
</script>