import {state} from './state'

let DRIFT = 0
let AGGRO = 1
let ATTACK = 2

def randomPosition
    let posx = Math.random() * state.svg.width * 1 - (state.svg.width * .5)
    let posy = Math.random() * state.svg.height * 1 - (state.svg.height * .5)
    let diffx = Math.abs(posx - state.player.position.x)
    let diffy = Math.abs(posy - state.player.position.y)
    if diffx < 400 and diffy < 400
        return randomPosition()
    return {
        x: posx
        y: posy
    }

export class Zombie
    @position = randomPosition()
    @rotation = Math.random() * 360
    @sector = "{~~(@position.x / 100)}-{~~(@position.y / 100)}"
    @state = DRIFT
    @speed = .2
    @max_speed = .6
    @size = 20
    @colisions_done = false
    @turn = 0

    def takeHit(bullet)
        @position.x -= Math.sin((bullet.rotation - 90) * 0.0174527778) * 10
        @position.y += Math.cos((bullet.rotation - 90) * 0.0174527778) * 10
        @state = AGGRO
        @speed = @max_speed

    def update
        @updateSector()
        @checkColisions()
        @checkLife()
        if @state == DRIFT
            @execDrift()
        if @state == AGGRO
            @execAggro()
        if @state == ATTACK
            @execAttack()

    def updateSector()
        let temp_sector = "{~~(@position.x / 100)}-{~~(@position.y / 100)}"
        if temp_sector != @sector
            state.sector[@sector] ||= Set.new
            state.sector[@sector].delete(self)
            @sector = temp_sector
            state.sector[@sector] ||= Set.new
            state.sector[@sector].add(self)

    def checkLife
        if @life < 0
            let index = state.zombies.indexOf(self)
            state.zombies.splice(index, 1) if (index != -1)

    def checkColisions
        let zom_col = @colideZombie()
        if zom_col
            let dx = Math.sin((@rotation + 90) * 0.0174527778) * @speed
            let dy = Math.cos((@rotation + 90) * 0.0174527778) * @speed
            zom_col.position.x += dx * 0.7
            zom_col.position.y -= dy * 0.7
            @position.x -= dx
            @position.y += dy

    def execAttack
        if @distanceToPlayerX() > @size or @distanceToPlayerY() > @size
            @state = AGGRO

    def execDrift
        if state.time % 200 == 0
            @turn = Math.floor(Math.random() * 2)
            @speed = Math.random() * 0.4
        if state.time % 3 == 0
            if @turn == 0
                @rotation += Math.random() * 3
            elif @turn == 1
                @rotation -= Math.random() * 3
        @move()

    def execAggro
        @rotation = @angleToPlayer()
        @move()
        if @distanceToPlayerX() < @size and @distanceToPlayerY() < @size
            @state = ATTACK

    def colideZombie
        state.sector[@sector] ||= Set.new
        for zombie of state.sector[@sector]
            if @distanceToZombieX(zombie) < @size and @distanceToZombieY(zombie) < @size
                return zombie
        return no

    def angleToPlayer
        let dx = state.player.position.x - @position.x
        let dy = state.player.position.y - @position.y
        -(Math.atan2(dx, dy)/0.0174527778 - 90) % 360

    def distanceToPlayerX
        Math.abs(state.player.position.x - @position.x)

    def distanceToPlayerY
        Math.abs(state.player.position.y - @position.y)

    def distanceToZombieX zombie
        Math.abs(zombie.position.x - @position.x)

    def distanceToZombieY zombie
        Math.abs(zombie.position.y - @position.y)

    def move
        @position.x -= Math.sin((@rotation - 90 ) * 0.0174527778) * @speed
        @position.y += Math.cos((@rotation - 90 ) * 0.0174527778) * @speed
