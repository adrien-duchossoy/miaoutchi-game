
const columnMapping = {
    left: 0,
    top: 1,
    bottom: 2,
    right: 3,
}

class Arrow {
    constructor (columnIndex, staticPositionLeft) {
        this.width = 30
        this.height = 30
        this.positionX = 10
        this.positionY = 0 - this.height //had to hard code the -50 otherwise RFA started before DOM
        this.columnIndex = columnMapping[columnIndex]
        this.staticPositionLeft = staticPositionLeft
        this.arrowElm = null

        this.createArrow()
        this.updateUI()
    }
    createArrow () {
        this.arrowElm = document.createElement('div')
        this.arrowElm.className = 'arrow-down'
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
        const newArrow = new Arrow(column, positionLeftStaticArrows)
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
    const initialDelay = Math.random() * 4000 + 1000
    setTimeout(() => scheduleSpawn(column), initialDelay)
})


const boardHeight = document.getElementById('board').getBoundingClientRect().height
const fall = () => {
    fallingArrows.forEach ((arrow, arrowIndex) => {
        arrow.positionY++
        arrow.updateUI()
        if (arrow.positionY > boardHeight) {
            fallingArrows.splice(arrowIndex, 1)
            arrow.arrowElm.remove()
        }
    })
    detectCollision()
        requestAnimationFrame( () => fall())
}

const detectCollision = () => {
    fallingArrows.forEach((arrow) => {
        console.log(staticPosition[arrow.columnIndex])
        console.log(arrow)
    })
}


    /*
    if(
        player.positionX < obstacleInstance.positionX + obstacleInstance.width &&
        player.positionX + player.width > obstacleInstance.positionX &&
        staticPosition.arrow.columnIndex < obstacleInstance.positionY + obstacleInstance.height &&
        staticPosition.top + player.height > obstacleInstance.positionY
    ){

    }
}*/

fall()
detectCollision()
