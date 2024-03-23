const axios = require("axios");
const CROSSMINT = require("./CrossmintRepo");

(async function() {
    console.log("Fetching current map...");
    const map = CROSSMINT.fetchMap("current");

    if (map.length == 0) throw Error("Map does not exist");    

    console.log("Fetched map; analyzing the soloons positions to ensure they are all adjacent to polyanets");
    let illegitimateSoloons = [];

    for (var row = 0; row < map.length; row++) {
        for (var column = 0; column < map[row].length; column++) {
            const currentSpaceObject = map[row][column];

            if (currentSpaceObject?.type == 1) {
                //looking for at least one adjacent polyanet

                const nextRow = row + 1;
                const prevRow = row - 1;
                const prevColumn = column - 1;
                const nextColumn = column + 1;

                if (nextRow < map.length && map[nextRow][column]?.type == 0) continue;
                if (prevRow >= 0 && map[prevRow][column]?.type == 0) continue; 
                if (nextColumn < map[row].length && map[row][nextColumn]?.type == 0) continue;
                if (prevColumn >= 0 && map[row][prevColumn]?.type == 0) continue;  

                illegitimateSoloons.push({row: row, column: column});
            }
        }
    }

    console.log("The following number of illegitimately placed soloons was discovered: " + illegitimateSoloons.length);
    console.log("Adjacency test completed");
  })();

