export default {


    async getAccount(summonerName)
    {
        if(summonerName){
            const account_response = await fetch('/api/summoner/'+ summonerName,{ method: 'GET', headers: {'Content-Type' : 'text/plain' }});
            const account_data = await account_response.json();
            return account_data;
        }
        else 
            throw new Error("Null String");
    },


    async getRankedInfoByID(summonerID)
    {
        if(summonerID){
            const ranked_response = await fetch('/api/ranked/'+ summonerID,{ method: 'GET', headers: {'Content-Type' : 'text/plain' }});
            const ranked_data = await  ranked_response.json();
            return ranked_data;
        }
        else 
            throw new Error("Null String");
    },



    async getCurrentGame(summonerID)
    {
        if(summonerID){
            const spectator_response = await fetch('/api/currentGame/'+ summonerID,{ method: 'GET', headers: {'Content-Type' : 'text/plain' }});
            const spectator_data = await spectator_response.json();
            return spectator_data;
        }
        else
            throw new Error("Null String")
    },

    async pull_champion_rates()
    {
        const champion_roles_response = await fetch('/api/playerRoles',{ method: 'GET', headers: {'Content-Type' : 'application/json' }});
        const champion_roles_data = await champion_roles_response.json();
        return champion_roles_data;

    },

    async getMatchHistory(summonerID)
    {
        if(summonerID == undefined)
            console.log("Poop");
        const matchHistory_response = await fetch('/api/matchHistory/' + summonerID,{ method: 'GET', headers: {'Content-Type' : 'text/plain' }});
        const matchHistory_data = await matchHistory_response.json();
        return matchHistory_data;
    },

    async getTeamRankedInfoByID(players)
    {
        let r = players.map(async function(player) {
            const account_response = await fetch('/api/summoner/'+ player.summonerName,{ method: 'GET', headers: {'Content-Type' : 'text/plain' }});
            const account_data = await account_response.json();
            let playerId = account_data.id;

            const ranked_response = await fetch('/api/ranked/'+ playerId,{ method: 'GET', headers: {'Content-Type' : 'text/plain' }});
            const ranked_data = await  ranked_response.json();
            return ranked_data;
        });

        r = await Promise.all(r);

        return r;
    }

}