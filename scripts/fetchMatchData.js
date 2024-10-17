const axios = require('axios');
require('dotenv').config();

const apiUrl = process.env.API_URL
const apiKey = process.env.API_KEY

async function fetchMatchData() {
    try {
        const response = await axios.get(apiUrl,{
            headers: {
                'Authorization':`Bearer ${apiKey}`
            }
        });
        const matchData = response.data;
        console.log('MatchData', matchData);

        return matchData;

    } catch (error) {
        console.error('PullDataError',error);  
    }
}

module.exports = { fetchMatchData };