
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
    static width = 90
    static height = 90

    constructor (columnIndex, staticPositionLeft) {
        this.width = Arrow.width
        this.height = Arrow.height
        this.positionX = 10
        this.positionY = 0 - this.height
        this.columnIndex = columnMapping[columnIndex]
        this.staticPositionLeft = staticPositionLeft
        this.collisionZone = ''
        this.hasBeenHit = false
        this.arrowElm = null

        this.createArrow()
        this.updateUI()
    }
    createArrow () {
        this.arrowElm = document.createElement('div')
        this.arrowElm.className = 'falling-arrow'
        this.arrowElm.style.zIndex = '0'
        const arrowImgElm = document.createElement('img')
        arrowImgElm.classList.add('arrow-icon')
        arrowImgElm.src = './img/icons/arrow-solidyellow.svg'
        const rotationIndex = [-90, 0, 180, 90]
        arrowImgElm.style.transform = `translate(-50%, -50%) rotate(${rotationIndex[this.columnIndex]}deg)`
        this.arrowElm.appendChild(arrowImgElm)
        const board = document.getElementById('board')
        this.arrowElm.style.left = `${this.staticPositionLeft}px`
        board.appendChild(this.arrowElm)  
    }

    updateUI () {
        this.arrowElm.style.transform = `translateY(${this.positionY}px)`
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
                height: position.height,
            })
        })
        return staticArrowsPosition
    }

let staticPosition = []
window.addEventListener('DOMContentLoaded', () => {
    staticPosition = getStaticArrowsPosition()
})


const fallingArrows = []
const arrowColumn = ['left', 'top', 'bottom', 'right']

const spawnArrow = (column) => {
    const columnIndex = columnMapping[column]
    const alreadyInColumn = fallingArrows.some(arrow => arrow.columnIndex === columnIndex)
    if (!alreadyInColumn) {
        const positionLeftStaticArrows = staticPosition[columnIndex].positionLeft
        const widthStaticArrows = staticPosition[columnIndex].width
        const newArrow = new Arrow(column, (positionLeftStaticArrows + (widthStaticArrows / 2) - (Arrow.width / 2)))
        fallingArrows.push(newArrow)
    }
}

const scheduleSpawn = () => {
    const delay = Math.random() * 2000 + 1500
    setTimeout(() => {
        const randomColumn = arrowColumn[Math.floor(Math.random() * arrowColumn.length)]
        spawnArrow(randomColumn)
        scheduleSpawn()
    }, delay)
}

const boardHeight = document.getElementById('board').getBoundingClientRect().height


let lastTime = null

const fall = (timestamp) => {
    if (!lastTime) lastTime = timestamp
    const delta = (timestamp - lastTime) / 1000
    lastTime = timestamp

    const speed = 300
    for (let i = fallingArrows.length - 1; i >= 0; i--) {
        const arrow = fallingArrows[i]
        arrow.positionY += speed * delta
        arrow.updateUI()
        if (arrow.positionY > boardHeight) {
            fallingArrows.splice(i, 1)
            arrow.arrowElm.remove()
        }
    }

    detectCollision()
    requestAnimationFrame(fall)
}

let score = 0

const detectCollision = () => {
    fallingArrows.forEach((arrow) => {

        let collisionProgress = ((arrow.positionY + arrow.height / 2) - staticPosition[arrow.columnIndex].positionTop) / staticPosition[arrow.columnIndex].height
        let previousZone = arrow.collisionZone
        if(collisionProgress >= -0.5 && collisionProgress < 0) {
            arrow.collisionZone='early'
        } else if (collisionProgress >= 0 && collisionProgress < 0.4) {
            arrow.collisionZone='ok_early'
        } else if (collisionProgress >= 0.4 && collisionProgress < 0.6) {
            arrow.collisionZone='perfect'
        } else if (collisionProgress >= 0.6 && collisionProgress < 1){
            arrow.collisionZone='ok_late'
        } else if (collisionProgress >= 1) {
            arrow.collisionZone='missed'
        } else if (collisionProgress < -0.5) {
            arrow.collisionZone=null
        }

        if (arrow.collisionZone === 'missed' && previousZone !== 'missed' && !arrow.hasBeenHit) {
            score -= 20
            updateScore()
        }
    })
}

const collisionOnInput = (columnOfArrow) => {
    return fallingArrows.find((arrow) => arrow.columnIndex === columnOfArrow && arrow.collisionZone)
}


const updateScore = () => {
    score = score < 0 ? 0 : score
    const displayedScore = document.getElementById('score-value').textContent = score
}

const getScoreFromZone = (zone) => {
    if(zone === 'early'){
        return 10
    } else if (zone === 'ok_early' || zone === 'ok_late'){
        return 50
    } else if (zone === 'perfect') {
        return 100
    } else if (zone === 'missed') {
        return -20
    }
}

const playerInput = () => {
    document.addEventListener("keydown", (event) => {
        const columnIndex = keyMapping[event.code]
        const staticArrowID = staticPosition[columnIndex].arrow
        const staticArrow = document.getElementById(`${staticArrowID}`)

        staticArrow.classList.add("is-pressed")
        setTimeout(() => staticArrow.classList.remove("is-pressed"), 300)

        const arrow = collisionOnInput(columnIndex)
        if (!arrow) return

        const isWin = ['ok_early', 'perfect', 'ok_late'].includes(arrow.collisionZone)
        if (isWin) {
            staticArrow.classList.add("is-a-win")
            setTimeout(() => staticArrow.classList.remove("is-a-win"), 300)
        }

        arrow.hasBeenHit = true
        fallingArrows.splice(fallingArrows.indexOf(arrow), 1)
        arrow.arrowElm.remove()
        score += getScoreFromZone(arrow.collisionZone)
        updateScore()
    })
}


const startCountdown = (callback) => {
    const countdownElm = document.getElementById('countdown')
    const numberElm = document.getElementById('countdown-number')
    let count = 3
    
    countdownElm.style.display = 'block'
    numberElm.textContent = count

    const interval = setInterval(() => {
        count --
        if (count===0) {
            numberElm.textContent = 'GO !'
        } else if (count < 0) {
            clearInterval(interval)
            countdownElm.style.display = 'none'
            callback()
        } else {
            numberElm.textContent = count
        }
    }, 1000);
}

const startGame = () => {
    document.getElementById('modal').style.display='none'
    document.getElementById('point-container').style.display = 'block'

    startCountdown(() => {
        scheduleSpawn()
        requestAnimationFrame(fall)
        playerInput()
    })
}

document.getElementById('start-btn').addEventListener('click', startGame)


