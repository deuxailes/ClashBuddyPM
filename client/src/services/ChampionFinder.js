const championByIdCache = {};
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

        return championByIdCache[language][key].name;
    }
}


async function getLatestChampionDDragon(language = "en_US") 
{

    if (championJson[language])
        return championJson[language];

    let response;

    response = await fetch(`https://ddragon.leagueoflegends.com/cdn/10.24.1/data/${language}/champion.json`);
    
    championJson[language] = await response.json();
    return championJson[language];
}