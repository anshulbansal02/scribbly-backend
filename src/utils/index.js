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

export { delay, randomInt, randomItem, shuffle };
