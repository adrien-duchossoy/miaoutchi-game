
class Arrow {
    constructor () {
        this.width = 20
        this.height = 20
        this.positionX = 10
        this.positionY = 10
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
                positionLeft: position.left
            })
        })
    }
    createArrow () {
        this.arrowElm = document.createElement('div')
        this.arrowElm.className = 'arrow-down'
        const board = document.getElementById('board')
        this.arrowElm.style.left = `${this.arrowsPositionLeft[0].positionLeft}px`
        board.appendChild(this.arrowElm)
        
    }
    updateUI () {
        console.log("arrow created")
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

new Arrow()