class Node {
    constructor(id, f_value) {
        this.id = id;
        this.f_value = f_value;
        this.parents = [];
    }

    set_parent(parent_node) {
        this.parents.push(...parent_node.parents);
        this.parents.push(parent_node.id);
    }

    get_distance(heuristic, alg) {
        return alg == "UCS"? this.f_value : this.f_value - heuristic[this.id];
    }
}

function calculate_f_value(adj_m, heuristic, parent_node, node, alg) {
    if (alg == "UCS"){
        return parent_node.f_value + adj_m[parent_node.id][node];
    } else {
        return parent_node.f_value - heuristic[parent_node.id] + adj_m[parent_node.id][node] + heuristic[node];
    }
}

function calculate2(adj_m, heuristic, start_node, goal_node, alg) {
    // initiate start_node and goal_node
    const start_node_obj = new Node(start_node, heuristic[start_node]);
    const goal_node_obj = new Node(goal_node, 0);

    // visited, open_nodes
    const visited = [];
    const open_nodes = [];

    // visit start node
    open_nodes.push(start_node_obj);
    visited.push(start_node_obj.id);

    while (open_nodes.length > 0) {
        // sort open nodes by f values
        open_nodes.sort((a, b) => a.f_value - b.f_value);

        // visit open_nodes with smallest f_value
        const current_node = open_nodes.shift();
        visited.push(current_node.id);

        // current node is goal node
        if (current_node.id === goal_node_obj.id) {
            current_node.parents.push(current_node.id);
            return [current_node.parents, current_node.get_distance(heuristic, alg)];
        }

        // find neighbors of current node
        const neighbors = [];
        for (let i = 0; i < adj_m[0].length; i++) {
            if (adj_m[current_node.id][i] !== 0 && !visited.includes(i)) {
                neighbors.push(i);
            }
        }

        // for each neighbors append to open nodes
        for (let i = 0; i < neighbors.length; i++) {
            const new_f_value = calculate_f_value(adj_m, heuristic, current_node, neighbors[i], alg);
            const new_node = new Node(neighbors[i], new_f_value);
            new_node.set_parent(current_node);
            open_nodes.push(new_node);
        }
    }

    return null;
}