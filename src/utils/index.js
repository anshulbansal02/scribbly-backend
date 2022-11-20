import { customAlphabet, nanoid } from "nanoid";

function randomInt(max, min = 0) {
    return Math.floor(Math.random() * max) + min;
}

function randomItem(array) {
    return array[randomInt(array.length)];
}

function viewfy(data) {
    if (typeof data == "object") {
        if (data.view) {
            return data.view;
        }
        for (const key in data) {
            data[key] = viewfy(data[key]);
        }
    }
    return data;
}

function delay(ms) {
    let _timeoutRef;
    let _resolveRef;

    const promise = new Promise((resolve) => {
        _resolveRef = resolve;
        _timeoutRef = setTimeout(resolve, ms);
    });

    return {
        wait: promise,
        cancel() {
            clearTimeout(_timeoutRef);
            _resolveRef();
        },
    };
}

export { viewfy, delay, randomInt, randomItem };
