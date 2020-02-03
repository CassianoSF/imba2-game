import {state} from '../state'

let DRIFT = 0
let AGGRO = 1
let ATTACK = 2
let DEAD = 3

def randomPosition player
    let posx = Math.random() * window.innerWidth * 30 - (window.innerWidth * 15)
    let posy = Math.random() * window.innerHeight * 30 - (window.innerHeight * 15)
    let diffx = Math.abs(posx - @player.position.x)
    let diffy = Math.abs(posy - @player.position.y)
    if diffx < 400 and diffy < 400
        return randomPosition()

    return {
        x: posx
        y: posy
    }

export class Zombie
    def constructor player, day
        @player = player
        @position = randomPosition(@player) 
        @rotation = Math.random() * 360
        @sector = "{~~(@position.x / 800)}|{~~(@position.y / 800)}"
        @state = 0
        @speed = .2
        @base_speed = .2
        @max_speed = .6 + (day / 20)
        @size = 20
        @turn = 0
        @life = 50 + (day*3)
        @death = 0

    def update
        @updateSector()
        @checkColisions()
        if @state is DEAD   then return @execDead()
        if @state is DRIFT  then return @execDrift()
        if @state is AGGRO  then return @execAggro()
        if @state is ATTACK then return @execAttack()

    def execDead
        if state.time - @death > 5000
            state.killed.delete(self)
            delete self

    def execAttack
        if not @start_attack
            @start_attack = state.time
        if state.time - @start_attack > 100 and @playerIsClose(@size * 1.5) and not @player_beaten
            @player_beaten = yes
            @player.takeHit(10)
        if state.time - @start_attack > 500
            @start_attack = no
            @player_beaten = no
            @state = AGGRO

    def execDrift
        if @playerDetected()
            @state = AGGRO
        if state.time % 200 == 0
            @turn = Math.floor(Math.random() * 2)
            @speed = Math.random() * @base_speed
        if state.time % 3 == 0
            if @turn == 0
                @rotation += Math.random() * 3
            elif @turn == 1
                @rotation -= Math.random() * 3
        @move()

    def execAggro
        if @player.inSafeZone()
            @state = DRIFT
        if @playerIsClose(@size * 1.5)
            @state = ATTACK
        @speed += 0.01 unless @speed >= @max_speed
        @rotation = @angleToPlayer()
        @move()

    def zombieColide
        state.sector[@sector] ||= Set.new
        for zombie of state.sector[@sector]
            if @distanceToZombieX(zombie) < @size and @distanceToZombieY(zombie) < @size
                return zombie unless zombie is self
        return no

    def angleToPlayer
        let dx = @player.position.x - @position.x
        let dy = @player.position.y - @position.y
        -(Math.atan2(dx, dy)/0.01745 - 90) % 360

    def distanceToPlayerX
        Math.abs(@player.position.x - @position.x)

    def distanceToPlayerY
        Math.abs(@player.position.y - @position.y)

    def distanceToZombieX zombie
        Math.abs(zombie.position.x - @position.x)

    def distanceToZombieY zombie
        Math.abs(zombie.position.y - @position.y)

    def move
        @position.x -= Math.sin((@rotation - 90) * 0.01745) * state.delta * @speed
        @position.y += Math.cos((@rotation - 90) * 0.01745) * state.delta * @speed

    def playerOnSight
        Math.abs((@angleToPlayer() - @rotation) % 360) < 30

    def playerIsClose distance
        @distanceToPlayerX() < distance and @distanceToPlayerY() < distance

    def playerDetected
        (@playerOnSight() and @playerIsClose(750) or @playerIsClose(40)) and not @player.inSafeZone()

    def currentSector
        "{~~(@position.x / 800)}|{~~(@position.y / 800)}"

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
        @life -= bullet.damage
        if @life <= 0
            state.sector[@sector].delete(self)
            state.killed.add(self)
            @state = DEAD
            @player.score += 10 * state.day
            @death = state.time