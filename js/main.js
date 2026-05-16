
class Arrow {
    constructor (columnIndex) {
        this.width = 30
        this.height = 30
        this.positionX = 10
        this.positionY = -50 - this.height
        this.columnIndex = columnIndex
        this.arrowElm = null
        this.arrowsPositionLeft = []

        this.getStaticArrowsPosition()
        this.createArrow()
        this.updateUI()
        this.fall()
    }
    getStaticArrowsPosition () {
        const arrows = document.querySelectorAll('.static-arrow')
        arrows.forEach((arrow) => {
            let position = arrow.getBoundingClientRect()
            this.arrowsPositionLeft.push({
                arrow: arrow.getAttribute('id'),
                positionLeft: position.left
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
        fall () {
        this.positionY++
        this.updateUI()
        requestAnimationFrame( () => this.fall())
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

/*setInterval(() => {
    new Arrow()
}, 3000)*/

new Arrow('left')
new Arrow('right')