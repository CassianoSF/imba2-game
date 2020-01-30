import {state} from './state'

let DRIFT = 0
let AGGRO = 1
let ATTACK = 2
let DEAD = 3

def randomPosition
    let posx = Math.random() * window.innerWidth * 30 - (window.innerWidth * 15)
    let posy = Math.random() * window.innerHeight * 30 - (window.innerHeight * 15)
    let diffx = Math.abs(posx - state.player.position.x)
    let diffy = Math.abs(posy - state.player.position.y)
    if diffx < 400 and diffy < 400
        return randomPosition()

    return {
        x: posx
        y: posy
    }

export class Zombie
    def constructor
        @position = randomPosition() 
        @rotation = Math.random() * 360
        @sector = "{~~(@position.x / 1800)}|{~~(@position.y / 1800)}"
        @state = DRIFT
        @speed = .2
        @max_speed = .7
        @size = 20
        @turn = 0
        @life = 100
        @death = 0

    def update
        @updateSector()
        @checkColisions()
        return @execDead()    if @state == DEAD
        return @execDrift()   if @state == DRIFT
        return @execAggro()   if @state == AGGRO
        return @execAttack()  if @state == ATTACK

    def execDead
        if state.time - @death > 5000 
            state.killed.delete(self)
            delete self

    def execAttack
        if @distanceToPlayerX() > @size or @distanceToPlayerY() > @size
            @state = AGGRO

    def execDrift
        @checkFollowPlayer()
        if state.time % 200 == 0
            @turn = Math.floor(Math.random() * 2)
            # @speed = Math.random() * 0.4
        if state.time % 3 == 0
            if @turn == 0
                @rotation += Math.random() * 3
            elif @turn == 1
                @rotation -= Math.random() * 3
        @move()

    def execAggro
        if @playerIsClose(@size*3)
            @state = ATTACK
        @rotation = @angleToPlayer()
        @move()

    def zombieColide
        state.sector[@sector] ||= Set.new
        for zombie of state.sector[@sector]
            if @distanceToZombieX(zombie) < @size and @distanceToZombieY(zombie) < @size
                return zombie if zombie isnt self
        return no

    def angleToPlayer
        let dx = state.player.position.x - @position.x
        let dy = state.player.position.y - @position.y
        -(Math.atan2(dx, dy)/0.01745 - 90) % 360

    def distanceToPlayerX
        Math.abs(state.player.position.x - @position.x)

    def distanceToPlayerY
        Math.abs(state.player.position.y - @position.y)

    def distanceToZombieX zombie
        Math.abs(zombie.position.x - @position.x)

    def distanceToZombieY zombie
        Math.abs(zombie.position.y - @position.y)

    def move
        @position.x -= Math.sin((@rotation - 90 ) * 0.01745) * state.delta * @speed
        @position.y += Math.cos((@rotation - 90 ) * 0.01745) * state.delta * @speed

    def playerOnSight
        Math.abs((@angleToPlayer() - @rotation) % 360) < 30

    def playerIsClose distance
        @distanceToPlayerX() < distance and @distanceToPlayerY() < distance

    def checkFollowPlayer
        if @playerOnSight() and @playerIsClose(250) or @playerIsClose(40)
            @speed = @max_speed
            @state = AGGRO

    def currentSector
        "{~~(@position.x / 1800)}|{~~(@position.y / 1800)}"

    def updateSector()
        let temp_sector = @currentSector()
        if temp_sector != @sector
            state.sector[@sector] ||= Set.new
            state.sector[@sector].delete(self)
            @sector = temp_sector
            state.sector[@sector] ||= Set.new
            state.sector[@sector].add(self)

    def checkColisions
        let zom_col = @zombieColide()
        if zom_col
            let dx = Math.sin((@rotation + 90) * 0.01745) * @speed * state.delta
            let dy = Math.cos((@rotation + 90) * 0.01745) * @speed * state.delta
            zom_col.position.x += dx * 0.5
            zom_col.position.y -= dy * 0.5
            @position.x -= dx
            @position.y += dy

    def takeHit(bullet)
        @position.x -= Math.sin((bullet.rotation - 90) * 0.01745) * bullet.power
        @position.y += Math.cos((bullet.rotation - 90) * 0.01745) * bullet.power
        @state = AGGRO
        @speed = @max_speed
        @life -= bullet.damage
        if @life <= 0
            state.sector[@sector].delete(self)
            state.killed.add(self)
            @state = DEAD
            @death = state.time