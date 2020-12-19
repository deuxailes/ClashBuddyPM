<template>
  <v-app  style="background-color: #fff4f0;">
    
    <nav-bar></nav-bar>
  
    <v-main >
      <transition name="slide-fade" mode="out-in" appear>
        <router-view />
      </transition>
    </v-main>    


      
  </v-app>
</template>

<script>

import NavBar from '@/components/NavBar'


export default {
  name: 'App',

  components: {
    NavBar
    
  },

  data: () => ({
    drawer: null
  })
};
</script>


<style scoped>
.v-application {
  background-color: #120d10;
}


.slide-fade-enter-active {
  transition: all .3s  ;
}
.slide-fade-leave-active {
  transition: all .3s ;
}
.slide-fade-enter
/* .slide-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translate(5em, 0);
}

.slide-fade-leave-to{
  opacity: 0;
  transform: translate(-5em, 0);
}


</style>