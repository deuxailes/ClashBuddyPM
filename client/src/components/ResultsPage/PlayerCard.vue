<template>
<v-col class="d-flex justify-center " >
  <v-card color="#385F73" dark ripple width = "500" max-width="500" height="200">

    
    <v-card-text>
      <v-row>
        <div>{{summonerName}}</div>
      </v-row>
      <v-row>
        <div>{{champion}}</div>
      </v-row>
      <v-row>
        <div>{{currentRank}}</div>
      </v-row>
      
      <v-row>
        <div>{{winRate}}</div>
      </v-row>
    


      
    </v-card-text>

  </v-card>
</v-col>
</template>

<script>
export default {
  props:['summonerName','currentRank','winRate','champion'],
  created: function (){
    
  }
  

}

</script>