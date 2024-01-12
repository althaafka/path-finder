class Node {
    constructor(id, fValue) {
        this.id = id;
        this.fValue = fValue;
        this.parents = [];
    }

    setParent(parentNode) {
        this.parents.push(...parentNode.parents);
        this.parents.push(parentNode.id);
    }

    getAStarDistance(heuristic) {
        return this.fValue - heuristic[this.id];
    }

    getUCSDistance() {
        return this.fValue;
    }
}