
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
        this.currentStreak = 0
        this.arrowsMissed = 0
        this.streakThreshold = [3, 7, 12, 16, 20, 24, 28, 32, 36, 40, 45, 50, 60, 70, 100, 150, 200]
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
            this.animationFrameId = requestAnimationFrame((timestamp) => this.fall(timestamp))
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
        this.animationFrameId = requestAnimationFrame((timestamp) => this.fall(timestamp))
    }

    updateCollisionZone(arrow) {
        const collisionProgress = ((arrow.positionY + arrow.height / 2) - this.staticPosition[arrow.columnIndex].positionTop) / this.staticPosition[arrow.columnIndex].height
        
        if (collisionProgress < -0.5) return null
        if (collisionProgress >= -0.5 && collisionProgress < 0) return 'early'
        if (collisionProgress >= 0 && collisionProgress < 0.4) return 'ok_early'
        if (collisionProgress >= 0.4 && collisionProgress < 0.6) return 'perfect'
        if (collisionProgress >= 0.6 && collisionProgress < 1) return 'ok_late'
        if (collisionProgress >= 1) return 'missed'
    }

    handleMiss(arrow) {
        this.score -= 20
        this.updateScore()
        this.arrowsPlayed++
        this.arrowsMissed++
        this.currentStreak = 0
        triggerStreakEffect(this.currentStreak, 'miss')
        if (this.arrowsMissed >= 5) this.endGame()
        this.checkArrowsPlayed()
    }

    detectCollision() {
        this.fallingArrows.forEach((arrow) => {
            const previousZone = arrow.collisionZone
            arrow.collisionZone = this.updateCollisionZone(arrow)
            if (arrow.collisionZone === 'missed' && previousZone !== 'missed' && !arrow.hasBeenHit) {
                this.handleMiss(arrow)
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
            this.currentStreak ++
            triggerStreakEffect(this.currentStreak, 'streak')
        }

        arrow.hasBeenHit = true
        this.arrowsMissed = 0
        this.arrowsPlayed ++
        this.checkArrowsPlayed()
        this.fallingArrows.splice(this.fallingArrows.indexOf(arrow), 1)
        arrow.arrowElm.remove()
        this.score += getScoreFromZone(arrow.collisionZone)
        this.updateScore()
    })
    }

    checkArrowsPlayed () {
        if (this.arrowsPlayed >= this.levels[this.currentLevel - 1].arrowCount) {
            this.isLastArrow = true
        }
    }

    start () {
        document.getElementById('modal').style.display='none'
        document.getElementById('point-container').style.display = 'block'
        document.getElementById('level-container').style.display = 'block'
        this.staticPosition = getStaticArrowsPosition()
        menuMusic.muted = true
        menuMusic.play().catch(() => {})
        menuMusic.pause()
        menuMusic.muted = false

        startCountdown(() => {
            this.scheduleSpawn()
            this.animationFrameId = requestAnimationFrame((timestamp) => this.fall(timestamp))
            this.playerInput()
        })
    }

    updateLevel () {
        const displayedLevel = document.getElementById('level-value').textContent = `${this.currentLevel}`
    }

    checkLevelUp () {
        if(this.currentLevel >= this.levels.length) {
            this.endGame ()
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

    endGame () {
        cancelAnimationFrame(this.animationFrameId)
        this.isPaused = true
        this.fallingArrows.forEach(arrow => arrow.arrowElm.remove())
        this.fallingArrows = []
        isStreakPlaying = false
        const modalEndGameElm = document.getElementById('modal-endgame')
        const scoreModalElm = document.getElementById('final-score')
        scoreModalElm.textContent = this.score
        modalEndGameElm.style.display = 'block'
        fadeOut(gameMusic, () => fadeIn(menuMusic))
    }

    restart () {
        cancelAnimationFrame(this.animationFrameId)
        this.speed = 300
        this.currentLevel = 1
        this.arrowsPlayed = 0
        this.score = 0
        this.fallingArrows = []
        this.staticPosition = []
        this.lastTime = null
        this.isLastArrow = false
        this.isPaused = false
        this.currentStreak = 0
        this.arrowsMissed = 0
        fadeOut(menuMusic, () => fadeIn(gameMusic))
        menuMusic.currentTime = 0
        gameMusic.play()

        document.getElementById('modal-endgame').style.display = 'none'
        this.updateScore()
        this.updateLevel()

        this.staticPosition = getStaticArrowsPosition()
        startCountdown(() => {
            this.scheduleSpawn()
            this.animationFrameId = requestAnimationFrame((timestamp) => this.fall(timestamp))
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
            if (gameMusic.paused) {
                fadeOut(menuMusic, () => fadeIn(gameMusic))
            }
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

let isStreakPlaying = false

const triggerStreakEffect = (streak, type) => {
    if ( type === 'streak' && !game.streakThreshold.includes(streak) ) return
    if (isStreakPlaying) return
    isStreakPlaying = true
    const streakPopupElm = document.getElementById('streak-popup')
    const images = {
        streak : ['./img/awesome.png',
            './img/perfect.png',
            './img/on-fire.png',
        ],
        miss : ['./img/oops.png',
            './img/come-on.png',
        ],
    }
    const randomWinImage = images[type][Math.floor(Math.random() * images[type].length)]
    const streakImgElm = document.getElementById('img-streak')
    streakImgElm.classList.remove('streak-in', 'streak-out')
    streakPopupElm.style.display = 'none'
    streakImgElm.src = randomWinImage
    streakImgElm.classList.add('streak-in')
    streakPopupElm.style.display = 'block'
    setTimeout(() => {
        streakImgElm.classList.remove('streak-in')
        streakImgElm.classList.add('streak-out')
        streakImgElm.addEventListener('animationend', () => {
            streakPopupElm.style.display = 'none'
            streakImgElm.classList.remove('streak-out')
            isStreakPlaying = false
        }, { once: true })
    }, 1000)
}


const game = new Game()
document.getElementById('start-btn').addEventListener('click', () => game.start())

document.getElementById('replay-btn').addEventListener('click', () => game.restart())

const menuMusic = new Audio('./audio/waiting-music.mp3')
const gameMusic = new Audio('./audio/ingame-music.mp3')
menuMusic.loop = true
gameMusic.loop = true

const fadeOut = (audio, callback) => {
    const interval = setInterval(() => {
        if (audio.volume > 0.05) {
            audio.volume -= 0.05
        } else {
            audio.volume = 0
            audio.pause()
            audio.currentTime = 0
            clearInterval(interval)
            if (callback) callback()
        }
    }, 50)
}

const fadeIn = (audio) => {
    audio.volume = 0
    audio.play()
    const interval = setInterval(() => {
        if (audio.volume < 0.95) {
            audio.volume += 0.05
        } else {
            audio.volume = 1
            clearInterval(interval)
        }
    }, 50)
}