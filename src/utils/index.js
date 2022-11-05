import { customAlphabet, nanoid } from "nanoid";

function generateRoomId() {
    return customAlphabet("abcdefghjkmnopqrstuvwxyz", 6)();
}

function generatePlayerId() {
    return nanoid(12);
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

export { generateRoomId, generatePlayerId, viewfy };
