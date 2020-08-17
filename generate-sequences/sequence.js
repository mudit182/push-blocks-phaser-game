
function findHighest(blockValues) {
    var highestScore = -1;
    var finalSeq = [];
    var lowestMoves = 10;

    var moves = 0;

    function checkInOrder(arr) {
        let ascending = true;
        let descending = true;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] < arr[i + 1]) {
                descending = false;
            }
            if (arr[i] > arr[i + 1]) {
                ascending = false;
            }
        }
        return ascending || descending;
    }

    function getTotal(arr) {
        var total = 0;
        arr.forEach(el => {
            total += el;
        });
        return total;
    }


    function swipeLeft(arr, index) {
        if (arr[index] === 0) {
            return undefined;
        }
        if (index - arr[index] < 0) {
            return undefined;
        }
        newIndex = index - arr[index]
        arr.splice(newIndex, 1, arr.splice(index, 1)[0]);
        return arr;
    }

    function swipeRight(arr, index) {
        if (arr[index] === 0) {
            return undefined;
        }
        if (index + arr[index] >= arr.length) {
            return undefined;
        }
        newIndex = index + arr[index];
        arr.splice(newIndex, 1, arr[index]);
        arr.splice(index, 1);
        return arr;
    }


    function resetFindHighestParams() {
        highestScore = -1;
        finalSeq = [];
        lowestMoves = 10;
    }

    function recursive(arr) {
        moves++;
        for (let i = 0; i < arr.length; i++) {
            // console.log('for i = ', i, ': ', arr);
            var seqs = [swipeLeft(arr.slice(), i), swipeRight(arr.slice(), i)];
            // console.log('seqs: ', seqs);

            seqs.forEach((seq) => {
                if (seq) {
                    if (checkInOrder(seq)) {
                        var newTotal = getTotal(seq);
                        if (newTotal > highestScore) {
                            highestScore = newTotal;
                            finalSeq = seq;
                            lowestMoves = moves;
                        } else if (newTotal === highestScore) {
                            if (moves < lowestMoves) {
                                lowestMoves = moves;
                            }
                        }
                    } else {
                        recursive(seq);
                    }
                }
            });
        }
        moves--;
    }

    resetFindHighestParams();
    if (checkInOrder(blockValues)) {
        highestScore = getTotal(blockValues);
        finalSeq = blockValues;
        lowestMoves = 0;
    } else {
        recursive(blockValues);
    }
    return [highestScore, finalSeq, lowestMoves];
}








function generateBlockValue(blockValues) {
    let value = 0;
    const threshholdAcceptable = 10;
    const zeroesAcceptable = 2;
    let threshhold = 0;
    let zeroes = 0;

    function getValueWeight(value) {
        let weight = 0;
        switch (value) {
            case 7:
            case 8:
            case 9:
                weight = 5;
                break;
            case 6:
                weight = 3;
                break;
            case 5:
                weight = 2;
                break;
            case 4:
                weight = 1;
                break;
            default:
                break;
        }
        return weight;
    }

    do {
        // generate a block value
        value = Math.floor(Math.random() * 10);
        // reset and determine parameters to check if value is good
        threshhold = 0;
        zeroes = 0;
        blockValues.forEach(blockValue => {
            threshhold += getValueWeight(blockValue);
            zeroes = (blockValue === 0) ? zeroes + 1 : zeroes;
        });
        threshhold += getValueWeight(value);
        zeroes = (value === 0) ? zeroes + 1 : zeroes;
    } while (threshhold >= threshholdAcceptable || zeroes >= zeroesAcceptable);
    return value;
}









function main(numOfSequences) {

    function overwriteFile(newData) {
        jsonData = JSON.stringify(newData);
        let fs = require('fs');
        fs.writeFile('file.json', jsonData, 'utf8', (err) => {
            if (err) {
                return console.error(err);
            } else {
                console.log("File created!");
            }
        });
    }

    function extendFile(newData) {
        let fs = require('fs');
        fs.readFile('file.json', 'utf8', (err, oldJsonData) => {
            if (err) {
                console.log(err);
            } else {
                oldData = JSON.parse(oldJsonData); //now it is an object


                oldData.items.push(...newData.items);
                oldData.count = oldData.items.length;
                // Add sequence with n moves to level n
                for (let i = 0; i < newData.items.length; i++) {
                    oldData.level[newData.items[i].moves].items.push(newData.items[i]);
                }
                // Update count of items for each level
                let newInfo = [];
                for (let i = 0; i < 11; i++) {
                    oldData.level[i].count = oldData.level[i].items.length;
                    newInfo.push(oldData.level[i].items.length);
                }
                oldData.info = newInfo;

                extendedData = oldData
                extendedJsonData = JSON.stringify(extendedData); //convert it back to json
                fs.writeFile('file.json', extendedJsonData, 'utf8', (err) => {
                    if (err) {
                        return console.error(err);
                    } else {
                        console.log("File extended!");
                    }
                }); // write it back 
            }
        });
    }

    let items = [];

    for (let i = 0; i < numOfSequences; i++) {
        let blockValues = [];
        // Generate semi-random block values
        for (let i = 0; i < 10; i++) {
            blockValues.push(generateBlockValue(blockValues));
        }
        // Need to shuffle block values as generator is semi-random
        for (let i = blockValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [blockValues[i], blockValues[j]] = [blockValues[j], blockValues[i]];
        }
        let result = findHighest(blockValues);

        let obj = {};
        obj.sequence = blockValues;
        obj.highestScore = result[0];
        obj.endSequence = result[1]
        obj.moves = result[2];

        items.push(obj);
    }


    // Sort sequences also into levels
    let level = {};
    // Create levels 0 - 10
    for (let i = 0; i < 11; i++) {
        level[i] = {}
        level[i].items = [];
    }
    // Add sequence with n moves to level n
    for (let i = 0; i < items.length; i++) {
        level[items[i].moves].items.push(items[i]);
    }
    // Add count of items for each level
    let info = []
    for (let i = 0; i < 11; i++) {
        level[i].count = level[i].items.length;
        info.push(level[i].items.length);
    }



    let data = {};
    data.count = items.length;
    data.info = info;
    data.items = items;
    data.level = level;

    // overwriteFile(data);
    extendFile(data);
}


let start = new Date();
main(1000);
let end = new Date();
let duration = Math.round((end - start) / 1000);

console.log('time taken: ', duration);
