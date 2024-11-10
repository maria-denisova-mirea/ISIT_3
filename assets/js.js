var field = {
    "width" : 70,
    "height" : 25
};

var reds_percent = 45;
var blues_percent = 45;
var min_same_neighbours = 2;
var view_area = 1;
var render_frame = 1;

var interval = 0;

var neighbours = 8;

class agent {
    constructor(x, y, color) {
        this.X = x;
        this.Y = y;
        this.Color = color;
        this.Unhappy = false;
    }
}

var agents = [];


function build_field() {
    document.getElementById("field").innerHTML = "";
    for (let i = 0; i < field["height"]; i++) {
        let ele_field_row = document.createElement('div')
        ele_field_row.className = "field-row";
        for (let j = 0; j < field["width"]; j++) {
            let ele_field_agent = document.createElement('div')
            ele_field_agent.className = "field-agent";
            ele_field_agent.id = `${j}-${i}`;
            ele_field_row.appendChild(ele_field_agent);
        }
        document.getElementById("field").appendChild(ele_field_row);
    }
}

function draw_agents() {
    ele_agents = document.getElementsByClassName("field-agent");
    for (const a of ele_agents) {
        a.classList.remove("red");
        a.classList.remove("blue");
        a.classList.remove("unhappy");
    }

    for (const agent of agents) {
        document.getElementById(`${agent.X}-${agent.Y}`).classList.add(agent.Color);
        if (agent.Unhappy) {
            document.getElementById(`${agent.X}-${agent.Y}`).classList.add("unhappy");
        } else {
            document.getElementById(`${agent.X}-${agent.Y}`).classList.remove("unhappy");
        }
    }
}

function find_agent_by_coords(x, y) {
    for (const agent of agents) {
        if (agent.X == x && agent.Y == y) {
            return agent;
        }
    }
    return null;
}

function find_random_space() {
    let pos = Math.floor(Math.random() * (field["width"] * field["height"]));
    for (let i = 0; i < (field["width"] * field["height"]); i++) {
        let opos = (pos + i) % (field["width"] * field["height"]);
        let x = opos % field["width"];
        let y = Math.floor(opos / field["width"]);
        if (!find_agent_by_coords(x, y)) {
            return [x, y];
        }
    }
    return null;
}

function calculate_happiness() {
    let counter = 0
    for (const agent of agents) {
        agent.Unhappy = true;
        let same_neighbours = 0;
        for (let i = -view_area; i <= view_area; i++) {
            for (let j = -view_area; j <= view_area; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                let neighbour = find_agent_by_coords((agent.X + i + field["width"]) % field["width"], (agent.Y + j + field["height"]) % field["height"]);
                if (neighbour?.Color == agent.Color) {
                    same_neighbours += 1;
                    if (same_neighbours >= min_same_neighbours) {
                        agent.Unhappy = false;
                        i = view_area + 1;
                        j = view_area + 1;
                    }
                }
            }
        }
        counter += agent.Unhappy ? 1 : 0;
    }
    document.getElementById('unhappy-count').innerText = `${counter} (${Math.round(counter * 100 / agents.length)}%)`;
    return counter;
}

const generateUniqueAgent = (usedCoordinates, color) => {
    let x, y;
    
    do {
        x = Math.floor(Math.random() * (field["width"]));
        y = Math.floor(Math.random() * (field["height"])); 
    } while (usedCoordinates.has(`${x},${y}`));
    
    usedCoordinates.add(`${x},${y}`);
    
    return new agent(x, y, color);
};

const createAgentsArray = () => {
    const agents = [];
    const usedCoordinates = new Set();
    
    for (let i = 0; i < field["width"] * field["height"] * reds_percent / 100; i++) {
        const agent = generateUniqueAgent(usedCoordinates, "red");
        agents.push(agent);
    }
    for (let i = 0; i < field["width"] * field["height"] * blues_percent / 100; i++) {
        const agent = generateUniqueAgent(usedCoordinates, "blue");
        agents.push(agent);
    }
    
    return agents;
};

function move_random_unhappy_agent() {
    let pos = Math.floor(Math.random() * (agents.length));
    for (let i = 0; i < agents.length; i++) {
        if (agents[(pos + i) % agents.length].Unhappy) {
            let space = find_random_space();
            let x = space[0];
            let y = space[1];
            agents[(pos + i) % agents.length].X = x;
            agents[(pos + i) % agents.length].Y = y;
            
            break;
        }
    }
}

function e_inputing(t, val) {
    document.getElementById(`${t}-current-value`).innerText = val;
}

function e_change(t, val) {
    if (t == 'happy') {
        min_same_neighbours = val;
    } else if (t == 'area') {
        view_area = val;
        document.getElementById('slider-neighbours').max = `${(1+ 2*val) * (1+ 2*val) - 1}`
        document.getElementById('happy-max').innerText = `${(1+ 2*val) * (1+ 2*val) - 1}`
    } else {
        render_frame = val;
    }
}

function start_simulating() {
    let frame = 0;
    interval = setInterval(() => {
        move_random_unhappy_agent();
        let happys = calculate_happiness();
        if (frame * happys === 0) {
            draw_agents();
        }
        frame = (frame + 1) % render_frame;
    }, 50);
}

window.addEventListener("DOMContentLoaded", () => {
    let w = document.querySelector('body').getBoundingClientRect();
    field["width"] = Math.floor(w.width / 20);
    field["height"] = Math.floor(w.height / 20);
    if (field["width"] > field["height"]) {
        field["width"] = field["height"];
    }
    if (field["width"] < field["height"]) {
        field["height"] = field["width"];
    }
    build_field();
    agents = createAgentsArray();
    calculate_happiness();
    draw_agents();
})