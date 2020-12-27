const championByIdCache = {};
const championByNameCache = {};
const championJson = {};

export default {
    async getChampionByKey(key, language = "en_US") 
    {
        if (!championByIdCache[language]) {
            let json = await getLatestChampionDDragon(language);

            championByIdCache[language] = {};
            
            for (var championName in json.data) {
                if (!json.data.hasOwnProperty(championName))
                    continue;

                const champInfo = json.data[championName];
                
                championByIdCache[language][champInfo.key] = champInfo;
            }
        }
        //console.log(championByIdCache);
        return championByIdCache[language][key].name;
    },
    async getChampionByName(name, language = "en_US") 
    {
        if (!championByNameCache[language]) {
            let json = await getLatestChampionDDragon(language);

            championByNameCache[language] = {};
            
            for (var championName in json.data) {
                if (!json.data.hasOwnProperty(championName))
                    continue;

                const champInfo = json.data[championName];
                
                championByNameCache[language][champInfo.name] = champInfo;
            }
        }
       
        return championByNameCache[language][name].key;
    }
}


async function getLatestChampionDDragon(language = "en_US") 
{

    if (championJson[language])
        return championJson[language];

    let response;

    response = await fetch(`https://ddragon.leagueoflegends.com/cdn/10.25.1/data/${language}/champion.json`);
    
    championJson[language] = await response.json();
    return championJson[language];
}