<template>
<v-col class="d-flex justify-center " >
  <v-card color = "#ffcba4" 
          dark
          ripple
          width = "500" 
          height="200"
          outlined class = "mx-auto">

        <v-list-item three-line>
          <v-list-item-content>
            <div class="overline mb-4">
              {{summonerName}}
            </div>
            <v-list-item-title class="headline mb-1">
              {{champion}}
            </v-list-item-title>
            <v-list-item-subtitle>{{currentRank}}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-avatar
            tile
            size="120"
            color="grey"
          >
            <v-img :src="require('@/assets/champion/' + champName + '.png')"></v-img>
            
          </v-list-item-avatar>
        </v-list-item>
    


      
    
  </v-card>

  
</v-col>
</template>

<script>
import champFinder from '@/services/ChampionFinder.js'
import leagueAPI from "@/services/LeagueAPICaller.js"

export default {
  data: () => ({

    
    }),
  computed: {
    champName: function(){
      if(this.champion.includes("'"))
          return this.champion.replace("'","");
      else if(this.champion.includes(" "))
          return this.champion.replace(" ","");
      else 
          return this.champion;
    }
  },

    props:['summonerName','currentRank','winRate','champion']

    // mounted: async function(){
    //   let player = await leagueAPI.getAccount(this.summonerName).then(async(data) =>{
    //     console.log(data);
    //     const postToDB = fetch('/api/summoner',{ method: 'POST', headers: {'Content-Type' : 'application/json' }, body: JSON.stringify(data)});
        
    //   });
      
    // }
    
}

</script>