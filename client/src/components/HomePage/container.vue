<template>
    <v-container fill-height fluid>          
        <v-row></v-row>
        <v-row></v-row>                

        <v-row justify = "center"><h1 ma-auto class="display-4">CLASH BUDDY</h1></v-row>
                
        <v-row justify = "center" align = "center" >
            <v-col  cols = "2">
                <search-bar/>
            </v-col>
        </v-row>

        <v-row></v-row>
        <v-row></v-row>
        <v-row></v-row>
    </v-container>            
</template>

<script>
import SearchBar from '@/components/HomePage/SearchBar'
export default {
    name: 'HomePage',
    components:{
        SearchBar
    }

}
</script>