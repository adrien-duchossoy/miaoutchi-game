
const columnMapping = {
    left: 0,
    top: 1,
    bottom: 2,
    right: 3,
}

const keyMapping = {
    ArrowLeft: 0,
    ArrowUp: 1,
    ArrowDown: 2,
    ArrowRight: 3,
}

class Arrow {
    static width = 30
    static height = 30

    constructor (columnIndex, staticPositionLeft) {
        this.width = Arrow.width
        this.height = Arrow.height
        this.positionX = 10
        this.positionY = 0 - this.height
        this.columnIndex = columnMapping[columnIndex]
        this.staticPositionLeft = staticPositionLeft
        this.isColliding = false
        this.arrowElm = null

        this.createArrow()
        this.updateUI()
    }
    createArrow () {
        this.arrowElm = document.createElement('div')
        this.arrowElm.className = 'falling-arrow'
        this.arrowElm.style.zIndex = '0'
        const board = document.getElementById('board')
        this.arrowElm.style.left = `${this.staticPositionLeft}px`
        board.appendChild(this.arrowElm)  
    }

    updateUI () {
        this.arrowElm.style.top = `${this.positionY}px`
        this.arrowElm.style.width = `${this.width}px`
        this.arrowElm.style.height = `${this.height}px`
    }
}



const getStaticArrowsPosition = () => {
        const arrows = document.querySelectorAll('.static-arrow')
        const staticArrowsPosition = []
        arrows.forEach((arrow) => {
            let position = arrow.getBoundingClientRect()
            staticArrowsPosition.push({
                arrow: arrow.getAttribute('id'),
                positionLeft: position.left,
                positionTop: position.top,
                positionBottom: position.bottom,
                width: position.width,
            })
        })
        return staticArrowsPosition
    }

const staticPosition = getStaticArrowsPosition()


const fallingArrows = []
const arrowColumn = ['left', 'top', 'bottom', 'right']

const spawnArrow = (column) => {
    if (fallingArrows.length < 2) {
        const positionLeftStaticArrows = staticPosition[columnMapping[column]].positionLeft
        const widthStaticArrows = staticPosition[columnMapping[column]].width
        const newArrow = new Arrow(column, (positionLeftStaticArrows + (widthStaticArrows / 2) - (Arrow.width / 2)))
        fallingArrows.push(newArrow)
    }
}

const scheduleSpawn = (column) => {
    const delay = Math.random() * 10000 + 5000
    setTimeout(() => {
        spawnArrow(column)
        scheduleSpawn(column)
    }, delay)
}

arrowColumn.forEach((column) => {
    const initialDelay = Math.random() * 2000 + 1000
    setTimeout(() => scheduleSpawn(column), initialDelay)
})


const boardHeight = document.getElementById('board').getBoundingClientRect().height

const fall = () => {
    fallingArrows.forEach((arrow, arrowIndex) => {
        arrow.positionY += 1.2
        arrow.updateUI()
        if (arrow.positionY > boardHeight) {
            fallingArrows.splice(arrowIndex, 1)
            arrow.arrowElm.remove()
        }
    })
    detectCollision()
    requestAnimationFrame(() => fall())
}

const detectCollision = () => {
    fallingArrows.forEach((arrow) => {

        if(
            arrow.positionY < staticPosition[arrow.columnIndex].positionTop &&
            arrow.positionY + arrow.height > staticPosition[arrow.columnIndex].positionTop
        ) {
            arrow.arrowElm.style.backgroundColor = 'blue'
            arrow.isColliding = true
        } else if (
            arrow.positionY > staticPosition[arrow.columnIndex].positionBottom
        ) {
            arrow.arrowElm.style.backgroundColor = ''
            arrow.isColliding = false
        }
    })
}

const collisionOnInput = (columnOfArrow) => {
    return fallingArrows.find((arrow) => arrow.columnIndex === columnOfArrow && arrow.isColliding === true)
}

let score = 0

const updateScore = () => {
    const displayedScore = document.getElementById('score-value').textContent = score
}

const playerInput = () => {
    const keyPress = document.addEventListener("keydown", (event) => {
        const columnIndex = keyMapping[event.code]
        const staticArrowID = staticPosition[columnIndex].arrow
        const staticArrow = document.getElementById(`${staticArrowID}`)
        staticArrow.classList.add("is-pressed")
        staticArrow.onanimationend = () => staticArrow.classList.remove("is-pressed")
        if (!collisionOnInput(columnIndex)) return
        score++
        updateScore()
    })
}



fall()
detectCollision()
playerInput()
