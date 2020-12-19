import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import HomePage from "../HomePage/container"
import ResultsPage from "../ResultsPage/container"

const routes = [
    {
        component: HomePage,
        name:"home-page",
        path: "/"
    },
    {
        component: ResultsPage,
        name:'results-page',
        path: '/results/summoner/:summonerName'
    }
]

export default new VueRouter({
    routes
});
