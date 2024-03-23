const axios = require("axios");
const CROSSMINT = require("./CrossmintRepo");

(async function() {
    console.log("Fetching current and goal maps...");
    const maps = await Promise.all([CROSSMINT.fetchMap("current"), CROSSMINT.fetchMap("goal")]);

    if (maps[0].length == 0 || maps[1].length == 0) throw Error("Map does not exist");
    if (maps[0].length != maps[1].length) throw Error("Maps rows quantity do not match");

    let bulkSpaceObjectsPlacements = [];

    console.log("Fetched maps; analyzing the adjustments needed to be made");

    for (var row = 0; row < maps[0].length; row++) {
        for (var column = 0; column < maps[0][row].length; column++) {
            const currentSpaceObject = maps[0][row][column];
            const targetSpaceObject = maps[1][row][column];

            if (currentSpaceObject == null && targetSpaceObject == null) continue;
            const objectPlacement = {row: row, column: column};

            if (targetSpaceObject == null) {
                bulkSpaceObjectsPlacements.push({
                    ...objectPlacement,
                    action: "remove",
                    objectType: CROSSMINT.mapCrossmintTargetObject(currentSpaceObject).objectType
                });
            }
            else if (targetSpaceObject.type != currentSpaceObject?.type) {
                bulkSpaceObjectsPlacements.push({
                    ...objectPlacement,
                    action: "insert",
                    ...CROSSMINT.mapCrossmintTargetObject(targetSpaceObject)
                });
            }
        }
    }

    console.log("Need to make the following number of adjustments: " + bulkSpaceObjectsPlacements.length);
    console.log("Submitting bulk placements adjustments...");
    await CROSSMINT.placeSpaceObjects(bulkSpaceObjectsPlacements);

    console.log("Placements completed");
  })();

