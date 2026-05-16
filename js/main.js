
class Arrow {
    constructor (columnIndex, arrowsPositionLeft) {
        this.width = 30
        this.height = 30
        this.positionX = 10
        this.positionY = 0 - this.height //had to hard code the -50 otherwise RFA started before DOM
        this.columnIndex = columnIndex
        this.arrowsPositionLeft = arrowsPositionLeft
        this.arrowElm = null

        this.createArrow()
        this.updateUI()
    }
    createArrow () {
        this.arrowElm = document.createElement('div')
        this.arrowElm.className = 'arrow-down'
        const board = document.getElementById('board')
        const columnMapping = {
            left: 0,
            top: 1,
            bottom: 2,
            right: 3,
        }
        const index = columnMapping[this.columnIndex]
        this.arrowElm.style.left = `${this.arrowsPositionLeft[index].positionLeft}px`
        board.appendChild(this.arrowElm)  
    }

    updateUI () {
        this.arrowElm.style.top = `${this.positionY}px`
        this.arrowElm.style.width = `${this.width}px`
        this.arrowElm.style.heigth = `${this.height}px`
    }
}

class ArrowStatic {
    constructor () {
        this.width = 20
        this.height = 20
        this.positionX = 0
        this.positionY = 0
    }
}

const fallingArrows = []
const arrowDirection = ['left', 'top', 'bottom', 'right']
const getStaticArrowsPosition = () => {
        const arrows = document.querySelectorAll('.static-arrow')
        const arrowsPositionLeft = []
        arrows.forEach((arrow) => {
            let position = arrow.getBoundingClientRect()
            arrowsPositionLeft.push({
                arrow: arrow.getAttribute('id'),
                positionLeft: position.left,
                positionTop: position.top,
                positionBottom: position.bottom,
            })
        })
        return arrowsPositionLeft
    }

const staticPosition = getStaticArrowsPosition()

arrowDirection.forEach((direction) => {
    setTimeout(() => {
            function spawnArrow () {
                if (fallingArrows.length < 2) {
                    const newArrow = new Arrow(direction, staticPosition)
                    fallingArrows.push(newArrow)
                }
                    setTimeout(spawnArrow, Math.random() * 10000 + 5000)
            }
            spawnArrow()
    }, Math.random() * 4000 + 1000)
})

const fall = () => {
    fallingArrows.forEach ((arrow, arrowIndex) => {
        arrow.positionY++
        arrow.updateUI()
        const boardHeight = document.getElementById('board').getBoundingClientRect().height
        if (arrow.positionY > boardHeight) {
            fallingArrows.splice(arrowIndex, 1)
            arrow.arrowElm.remove()
        }
    })
        requestAnimationFrame( () => fall())
}

const detectCollision = () => {

}

fall()
