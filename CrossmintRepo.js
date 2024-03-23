const axios = require('axios');

const CROSSMINT_CANDIDATE_ID = "d751293b-ed5e-400b-95ea-7895bfa3fb52";
const CROSSMINT_SPACE_OBJECT_API_ENDPOINT_PREFIX = "https://challenge.crossmint.io/api/";
const CROSSMINT_MAP_CURRENT_API_ENDPOINT = "https://challenge.crossmint.io/api/map/" + CROSSMINT_CANDIDATE_ID;
const CROSSMINT_MAP_GOAL_API_ENDPOINT = CROSSMINT_MAP_CURRENT_API_ENDPOINT + "/goal";
const CROSSMINT_SIMULTANEOUS_REQUESTS = 1;
const CROSSMINT_API_SLEEP = 1500;

module.exports.fetchMap = async(type) => {
    if (type != "current" && type != "goal") throw new Error("Not supported map type");
    if (type == "current") {
        const map = await axios.get(CROSSMINT_MAP_CURRENT_API_ENDPOINT);
        const matrix = map.data?.map?.content;
        if (matrix == null) return [[]];
        return matrix;
    }
    const map = await axios.get(CROSSMINT_MAP_GOAL_API_ENDPOINT);
    let matrix = map.data?.goal;
    if (matrix != null) {
        return matrix.map(r => r.map(x => {
            if (x == null || x == "SPACE") return null;
            if (x == "POLYANET") return {type : 0};
            const spaceObject = x.split("_");
            if (spaceObject.length == 2) {
                switch (spaceObject[0]) {
                    case "UP":
                    case "DOWN":
                    case "RIGHT":
                    case "LEFT":
                        return {type: 2, direction: spaceObject[0].toLowerCase()};
                    case "WHITE":
                    case "PURPLE":
                    case "RED":
                    case "BLUE":
                        return {type: 1, color: spaceObject[0].toLowerCase()};
                }
            }
            return null;
        }));
    }
    else return [[]];
};
    
module.exports.mapCrossmintTargetObject = (targetObject) => {
    let {type, ...arg} = targetObject;
    switch (type) {
        case 0:
            type = "polyanets";
            break;
        case 1:
            type = "soloons";
            break;
        case 2:
            type = "comeths";
            break;
    };
    return {
        ...arg,
        objectType: type
    };
};
    
module.exports.placeSpaceObjects = async (objects) => {
    let tasks = [];
    for (const i in objects) {
        const {action, objectType, ...val} = objects[i];
        let task;
        const actionURL = CROSSMINT_SPACE_OBJECT_API_ENDPOINT_PREFIX + objectType;
        if (action == "insert") {
            task = axios.post(actionURL, {...val, candidateId: CROSSMINT_CANDIDATE_ID});
        } 
        else {
            task = axios.delete(actionURL, {data: {...val, candidateId: CROSSMINT_CANDIDATE_ID}});
        }
        tasks.push(task);
        if (tasks.length >= CROSSMINT_SIMULTANEOUS_REQUESTS) {
            try {
                await Promise.all(tasks);
                if (CROSSMINT_API_SLEEP > 0) await new Promise(r => setTimeout(r, CROSSMINT_API_SLEEP));
            } catch (e) {
                console.log(e);
            }; 
        }
        tasks = [];
    }
    if (tasks.length > 0) {
        try {
            await Promise.all(tasks);
        } catch (e) {
            console.log(e);
        }; 
    }
}
