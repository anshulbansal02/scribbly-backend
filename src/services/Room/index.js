import { customAlphabet } from "nanoid";

function generateRoomId() {
    return customAlphabet("abcdefghjkmnopqrstuvwxyz", 6)();
}

export { generateRoomId };
