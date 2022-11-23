import Entity from "./Entity.js";

function createStore(entityClass) {
    function set(entity) {
        if (entity instanceof Entity) {
        } else {
            throw new Error("Object is not an instance of Entity type");
        }
    }

    function get(key) {}

    function remove(key)
}
