const https = require("https");
const fs = require("fs");

function randomInt(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function randomItem(array) {
    return array[randomInt(array.length)];
}

function delay(ms) {
    let timeoutRef;
    let resolveRef;

    const promise = new Promise((resolve) => {
        resolveRef = resolve;
        timeoutRef = setTimeout(resolve, ms);
    });

    return {
        wait: promise,
        cancel() {
            clearTimeout(timeoutRef);
            resolveRef();
        },
    };
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
}

function fetchFile(url, dest) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(dest, { flags: "wx" });
                file.on("finish", () => resolve());
                file.on("error", (err) => {
                    file.close();
                    if (err.code === "EEXIST") reject("File already exists");
                    else fs.unlink(dest, () => reject(err.message)); // Delete temp file
                });
                response.pipe(file);
            } else if (
                response.statusCode === 302 ||
                response.statusCode === 301
            ) {
                download(response.headers.location, dest).then(() => resolve());
            } else {
                reject(
                    `Server responded with ${response.statusCode}: ${response.statusMessage}`
                );
            }
        });

        request.on("error", (err) => {
            reject(err.message);
        });
    });
}

export { delay, randomInt, randomItem, shuffle, fetchFile };
