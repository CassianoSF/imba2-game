import {state} from './state'

def randomPosition
    let posx = Math.random() * state.svg.width
    let posy = Math.random() * state.svg.height
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
    @sector = "{~~(@position.x / 300)}-{~~(@position.y / 300)}"
    @state = 'drift'
    @speed = 1
    @max_speed = 3
    @size = 20
    @colisions_done = false

    def takeHit(bullet)
        # let audio = Audio.new("sounds/zombie_hit/{~~(Math.random * 4)}.wav")
        # audio.play
        @position.x -= Math.sin((bullet.rotation - 90) * 0.0174527778) * 10
        @position.y += Math.cos((bullet.rotation - 90) * 0.0174527778) * 10
        # unless taking-hit
        #     life -= hit.damage
        #     taking-hit = ~~(Math.random * 5 + 1)
        #     setTimeout(&, 50) do 
        #         taking-hit = no
        @state = 'aggro'
        @speed = @max_speed

    def update
        @updateSector()
        @checkColisions()
        @checkLife()
        if @state == 'drift'
            @execDrift()
        if @state == 'aggro'
            @execAggro()
        if @state == 'attack'
            @execAttack()

    def updateSector()
        let temp_sector = "{~~(@position.x / 300)}-{~~(@position.y / 300)}"
        if temp_sector != @sector
            state.sector[@sector] ||= []
            let index = state.sector[@sector].indexOf(self)
            state.sector[@sector].splice(index, 1) if index != -1
            @sector = temp_sector
            state.sector[@sector] ||= []
            state.sector[@sector].push(self)

    def checkLife
        if @life < 0
            let index = state.zombies.indexOf(self)
            state.zombies.splice(index, 1) if (index != -1)

    def checkColisions
        let zom_col = @colideZombie()
        if zom_col
            let dx = Math.sin((@rotation - 90) * 0.0174527778) * @speed
            let dy = Math.cos((@rotation - 90) * 0.0174527778) * @speed
            zom_col.position.x += dx * 0.7
            zom_col.position.y -= dy * 0.7
            @position.x -= dx
            @position.y += dy

    def execAttack
        if @distanceToPlayerX() > @size or @distanceToPlayerY() > @size
            @state = 'aggro'

    def execDrift
        @last_time ||= state.time
        if state.time - @last_time > 200
            @last_time = state.time
            @turn = ['turn_left', 'turn_right'][~~(Math.random() * 2)]
        if @turn == 'turn_right'
            @rotation += Math.random()
        if @turn == 'turn_left'
            @rotation -= Math.random()
        @move()

    def execAggro
        @rotation = @angleToPlayer()
        @move()
        if @distanceToPlayerX() < @size and @distanceToPlayerY() < @size
            @state = 'attack'

    def colideZombie
        for zombie in state.sector[@sector]
            if @distanceToZombieX(zombie) < @size and @distanceToZombieY(zombie) < @size
                return zombie
        return no

    def angleToPlayer
        let dx = state.player.position.x - @position.x
        let dy = state.player.position.y - @position.y
        -(Math.atan2(dx, dy)/0.0174527778 + 90) % 360

    def distanceToPlayerX
        Math.abs(state.player.position.x - @position.x)

    def distanceToPlayerY
        Math.abs(state.player.position.y - @position.y)

    def distanceToZombieX zombie
        Math.abs(zombie.position.x - @position.x)

    def distanceToZombieY zombie
        Math.abs(zombie.position.y - @position.y)

    def move
        @position.x -= Math.sin((@rotation + 90 ) * 0.0174527778) * @speed
        @position.y += Math.cos((@rotation + 90 ) * 0.0174527778) * @speed
