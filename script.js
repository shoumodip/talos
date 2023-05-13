const automata = [
    {
        "name": "Game Of Life",
        "colors": [
            {"name": "Dead", "value": "#1e1e1e"},
            {"name": "Alive", "value": "#ce9178"}
        ],
        "update": (neighbours, current) => {
            switch (neighbours[1]) {
            case 3: return 1
            case 2: return current
            default: return 0
            }
        }
    },

    {
        "name": "Day and Night",
        "colors": [
            {"name": "Dead", "value": "#1e1e1e"},
            {"name": "Alive", "value": "#ce9178"}
        ],
        "update": (neighbours, current) => {
            switch (neighbours[1]) {
            case 3: case 6: case 7: case 8: return 1
            case 4: return current
            default: return 0
            }
        }
    },

    {
        "name": "Seeds",
        "colors": [
            {"name": "Dead", "value": "#1e1e1e"},
            {"name": "Alive", "value": "#ce9178"}
        ],
        "update": (neighbours, current) => {
            return (neighbours[1] == 2) | 0
        }
    },

    {
        "name": "Brian's Brain",
        "colors": [
            {"name": "Dead", "value": "#1e1e1e"},
            {"name": "Alive", "value": "#ce9178"},
            {"name": "Dying", "value": "#9cdcfe"}
        ],
        "update": (neighbours, current) => {
            switch (current) {
            case 0: return (neighbours[1] == 2) | 0
            case 1: return 2
            case 2: return 0
            }
        }
    },

    {
        "name": "Wireworld",
        "colors": [
            {"name": "Empty", "value": "#1e1e1e"},
            {"name": "Electron Head", "value": "#ce9178"},
            {"name": "Electron Tail", "value": "#9cdcfe"},
            {"name": "Conductor", "value": "#6a9955"}
        ],
        "update": (neighbours, current) => {
            switch (current) {
            case 0: return 0
            case 1: return 2
            case 2: return 3
            case 3: return (neighbours[1] == 1 || neighbours[1] == 2) ? 1 : 3
            }
        }
    }
]

const ROWS = 64
const COLS = 64

function render(ctx, board, colors) {
    const WIDTH = ctx.canvas.width / COLS
    const HEIGHT = ctx.canvas.height / ROWS

    ctx.fillStyle = colors[0].value
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.fillStyle = colors[board[row][col]].value
            ctx.fillRect(col * WIDTH, row * HEIGHT, WIDTH, HEIGHT)
        }
    }
}

function update(board, buffer, automaton) {
    const mod = (a, b) => (a % b + b) % b
    const neighbours = Array(automaton.colors.length)

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            neighbours.fill(0)

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr != 0 || dc != 0) {
                        const r = mod(row + dr, ROWS)
                        const c = mod(col + dc, COLS)
                        neighbours[board[r][c]]++
                    }
                }
            }

            buffer[row][col] = automaton.update(neighbours, board[row][col])
        }
    }

    return [buffer, board]
}

window.onload = () => {
    let color = 1
    let automaton = automata[0]

    const colors = document.getElementById("colors")

    colors.onchange = () => {
        color = Number(colors.value)
    }

    const list = document.getElementById("list")

    function changeAutomaton(index) {
        automaton = automata[index]
        colors.replaceChildren(...automaton.colors.map((color, i) => {
            const option = document.createElement("option")
            option.text = color.name
            option.value = i
            return option
        }))
        colors.value = 1
        color = 1
    }

    list.onchange = () => {
        changeAutomaton(Number(list.value))
    }

    changeAutomaton(0)

    automata.forEach((automaton, i) => {
        const option = document.createElement("option")
        option.text = automaton.name
        option.value = i
        list.appendChild(option)
    })

    let board = Array(ROWS).fill(0).map(() => Array(COLS).fill(0))
    let buffer = Array(ROWS).fill(0).map(() => Array(COLS).fill(0))

    document.getElementById("save").onclick = () => {
        const data = board.map((row) => row.join("x")).join("y")
        const path = automaton.name.replaceAll(" ", "-").toLowerCase()

        const link = document.createElement("a")
        link.setAttribute("href", "data:text/plain;charset=utf-8," + data)
        link.setAttribute("download", "automaton-" + path)
        link.click()
    }

    const app = document.getElementById("app")
    const ctx = app.getContext("2d")

    app.onclick = (event) => {
        const WIDTH = ctx.canvas.width / COLS
        const HEIGHT = ctx.canvas.height / ROWS

        const col = Math.floor(event.offsetX / WIDTH)
        const row = Math.floor(event.offsetY / HEIGHT)

        board[row][col] = color
        render(ctx, board, automaton.colors)
    }

    document.getElementById("load").onclick = () => {
        const file = document.createElement("input")
        file.type = "file"
        file.onchange = () => {
            const reader = new FileReader();
            reader.readAsText(file.files[0], "UTF-8");
            reader.onload = () => {
                board = reader.result.split("y").map((row) => row.split("x"))
                render(ctx, board, automaton.colors)
            }
        }

        file.click()
    }

    let playing = false

    const play = document.getElementById("play")

    play.onclick = () => {
        if (playing) {
            play.innerText = "Play"
            playing = false
        } else {
            play.innerText = "Pause"
            playing = true
        }
    }

    function step() {
        [board, buffer] = update(board, buffer, automaton)
        render(ctx, board, automaton.colors)
    }

    document.getElementById("step").onclick = step

    setInterval(() => {
        if (playing) {
            step()
        }
    }, 50)

    render(ctx, board, automaton.colors)
}
