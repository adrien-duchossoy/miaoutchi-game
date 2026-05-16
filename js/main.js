
class Arrow {
    constructor (columnIndex) {
        this.width = 30
        this.height = 30
        this.positionX = 10
        this.positionY = 0 - this.height //had to hard code the -50 otherwise RFA started before DOM
        this.columnIndex = columnIndex
        this.arrowElm = null
        this.arrowsPositionLeft = []

        this.getStaticArrowsPosition()
        this.createArrow()
        this.updateUI()
    }
    getStaticArrowsPosition () {
        const arrows = document.querySelectorAll('.static-arrow')
        arrows.forEach((arrow) => {
            let position = arrow.getBoundingClientRect()
            this.arrowsPositionLeft.push({
                arrow: arrow.getAttribute('id'),
                positionLeft: position.left,
                positionTop: position.top,
                positionBottom: position.bottom,
            })
        })
    }
    createArrow () {
        this.arrowElm = document.createElement('div')
        this.arrowElm.className = 'arrow-down'
        const board = document.getElementById('board')
        //Potential refactor : take numbers as argument and get this if statement in one line
        if(this.columnIndex === 'left') {
            this.arrowElm.style.left = `${this.arrowsPositionLeft[0].positionLeft}px`
        } else if (this.columnIndex === 'top') {
            this.arrowElm.style.left = `${this.arrowsPositionLeft[1].positionLeft}px`
        } else if (this.columnIndex === 'bottom') {
            this.arrowElm.style.left = `${this.arrowsPositionLeft[2].positionLeft}px`
        } else if (this.columnIndex === 'right') {
            this.arrowElm.style.left = `${this.arrowsPositionLeft[3].positionLeft}px`
        }
        board.appendChild(this.arrowElm)  
    }

    updateUI () {
        console.log("arrow created")
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

const spawnArrowLeft = () => {
    let newArrowLeft = new Arrow('left')
    fallingArrows.push(newArrowLeft)
    setTimeout(spawnArrowLeft, Math.random() * 10000 + 5000)
}
const spawnArrowTop = () => {
    let newArrowTop = new Arrow('top')
    fallingArrows.push(newArrowTop)
    setTimeout(spawnArrowTop, Math.random() * 10000 + 5000)
}
const spawnArrowBottom = () => {
    let newArrowBottom = new Arrow('bottom')
    fallingArrows.push(newArrowBottom)
    setTimeout(spawnArrowBottom, Math.random() * 10000 + 5000)
}
const spawnArrowRight = () => {
    let newArrowRight = new Arrow('right')
    fallingArrows.push(newArrowRight)
    setTimeout(spawnArrowRight, Math.random() * 10000 + 5000)
}

const fall = () => {
    fallingArrows.forEach ((arrow) => {
        arrow.positionY++
        arrow.updateUI()
    })
        requestAnimationFrame( () => fall())
}

spawnArrowLeft()
spawnArrowTop()
spawnArrowBottom()
spawnArrowRight()
fall()
