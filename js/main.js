
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

class Game {
    constructor () {
        this.speed = 300
        this.currentLevel = 1
        this.arrowsPlayed = 0
        this.levels = [
            { level: 1, speed: 300, minDelay: 1500, maxDelay: 3500, arrowCount: 10 },
            { level: 2, speed: 400, minDelay: 1000, maxDelay: 2500, arrowCount: 15 },
            { level: 3, speed: 500, minDelay: 700,  maxDelay: 1800, arrowCount: 20 },
            { level: 4, speed: 600, minDelay: 400,  maxDelay: 1000, arrowCount: 30 },
            { level: 5, speed: 700, minDelay: 300,  maxDelay: 500, arrowCount: 40 },
        ]
        this.score = 0
        this.fallingArrows = []
        this.staticPosition = []
        this.lastTime = null
        this.isLastArrow = false
        this.isPaused = false
    }

    spawnArrow (column) {
        const columnIndex = columnMapping[column]
        const alreadyInColumn = this.fallingArrows.some(arrow => arrow.columnIndex === columnIndex)
        if (!alreadyInColumn) {
            const positionLeftStaticArrows = this.staticPosition[columnIndex].positionLeft
            const widthStaticArrows = this.staticPosition[columnIndex].width
            const newArrow = new Arrow(column, (positionLeftStaticArrows + (widthStaticArrows / 2) - (Arrow.width / 2)))
            this.fallingArrows.push(newArrow)
        }
    }

    scheduleSpawn () {
        if (this.isLastArrow) return
        const currentLevel = this.levels[this.currentLevel -1]
        const delay = Math.random() * (currentLevel.maxDelay - currentLevel.minDelay) + currentLevel.minDelay
        setTimeout(() => {
            if (this.isPaused) return
            const randomColumn = arrowColumn[Math.floor(Math.random() * arrowColumn.length)]
            this.spawnArrow(randomColumn)
            this.scheduleSpawn()
        }, delay)
    }

    fall (timestamp) {
        if(this.isPaused) {
            this.lastTime = timestamp
            requestAnimationFrame((timestamp) => this.fall(timestamp))
            return
        }

        const currentLevel = this.levels[this.currentLevel - 1]
        if (!this.lastTime) this.lastTime = timestamp
        const delta = (timestamp - this.lastTime) / 1000
        this.lastTime = timestamp

        for (let i = this.fallingArrows.length - 1; i >= 0; i--) {
            const arrow = this.fallingArrows[i]
            arrow.positionY += currentLevel.speed * delta
            arrow.updateUI()
            if (arrow.positionY > boardHeight) {
                this.fallingArrows.splice(i, 1)
                arrow.arrowElm.remove()
            }
        }

        if (this.isLastArrow && this.fallingArrows.length === 0) {
                this.checkLevelUp()
        }

        this.detectCollision()
        requestAnimationFrame((timestamp) => this.fall(timestamp))
    }

    detectCollision () {
        this.fallingArrows.forEach((arrow) => {

            let collisionProgress = ((arrow.positionY + arrow.height / 2) - this.staticPosition[arrow.columnIndex].positionTop) / this.staticPosition[arrow.columnIndex].height
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
                this.score -= 20
                this.updateScore()
                this.arrowsPlayed ++
                if (this.arrowsPlayed >= this.levels[this.currentLevel - 1].arrowCount) {
                    this.isLastArrow = true
                }
            }
    })
    }

    updateScore () {
        this.score = this.score < 0 ? 0 : this.score
        const displayedScore = document.getElementById('score-value').textContent = `${this.score}`
    }

    collisionOnInput (columnOfArrow) {
        return this.fallingArrows.find((arrow) => arrow.columnIndex === columnOfArrow && arrow.collisionZone)
    }

    playerInput () {
        document.addEventListener("keydown", (event) => {
        const columnIndex = keyMapping[event.code]
        const staticArrowID = this.staticPosition[columnIndex].arrow
        const staticArrow = document.getElementById(`${staticArrowID}`)

        staticArrow.classList.add("is-pressed")
        setTimeout(() => staticArrow.classList.remove("is-pressed"), 300)

        const arrow = this.collisionOnInput(columnIndex)
        if (!arrow) return

        const isWin = ['ok_early', 'perfect', 'ok_late'].includes(arrow.collisionZone)
        if (isWin) {
            staticArrow.classList.add("is-a-win")
            setTimeout(() => staticArrow.classList.remove("is-a-win"), 300)
        }

        arrow.hasBeenHit = true
        this.arrowsPlayed ++
        if (this.arrowsPlayed >= this.levels[this.currentLevel - 1].arrowCount) {
            this.isLastArrow = true
        }
        this.fallingArrows.splice(this.fallingArrows.indexOf(arrow), 1)
        arrow.arrowElm.remove()
        this.score += getScoreFromZone(arrow.collisionZone)
        this.updateScore()
    })
    }

    start () {
        document.getElementById('modal').style.display='none'
        document.getElementById('point-container').style.display = 'block'
        document.getElementById('level-container').style.display = 'block'
        this.staticPosition = getStaticArrowsPosition()

        startCountdown(() => {
            this.scheduleSpawn()
            requestAnimationFrame((timestamp) => this.fall(timestamp))
            this.playerInput()
        })
    }

    updateLevel () {
        const displayedLevel = document.getElementById('level-value').textContent = `${this.currentLevel}`
    }

    checkLevelUp () {
        if(this.currentLevel > this.levels.length) {
            const boardElm = document.getElementById('board')

            //create a real modal for game over
            const gameOverModal = document.createElement('div')
            gameOverModal.innerHTML = `Game over`
            boardElm.appendChild(gameOverModal)
            return
        }

        this.isLastArrow = false
        this.currentLevel++
        this.arrowsPlayed = 0
        this.updateLevel()
        this.isPaused = true
        levelUp(() => {
            this.isPaused = false
            this.scheduleSpawn()
        })
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

const arrowColumn = ['left', 'top', 'bottom', 'right']


const boardHeight = document.getElementById('board').getBoundingClientRect().height



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

const levelUp = (callback) => {
    const levelUpElm = document.getElementById('level-up')

    levelUpElm.textContent = `LEVEL ${game.currentLevel}`
    levelUpElm.style.display = 'block'
    setTimeout(() => {
        levelUpElm.style.display = 'none'
        startCountdown(callback)
    }, 1500) 
}


const game = new Game()
document.getElementById('start-btn').addEventListener('click', () => game.start())


