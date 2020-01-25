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
    @zombie_state = 'drift'
    @speed = 1
    @max_speed = 3
    @size = 20

    def takeHit(bullet)
        # let audio = Audio.new("sounds/zombie_hit/{~~(Math.random * 4)}.wav")
        # audio.play
        @position.x -= Math.sin((bullet.rotation - 90) * 0.0174527778) * 30
        @position.y += Math.cos((bullet.rotation - 90) * 0.0174527778) * 30
        # unless taking-hit
        #     life -= hit.damage
        #     taking-hit = ~~(Math.random * 5 + 1)
        #     setTimeout(&, 50) do 
        #         taking-hit = no
        @zombie_state = 'aggro'
        @speed = @max_speed

    def update
        @checkColisions()
        if @zombie_state == 'drift'
            @execDrift()
        if @zombie_state == 'aggro'
            @execAggro()

    def checkColisions
        @zombieColision()
        @playerColision()

    def zombieColision
        let zom_col = @colideZombie()
        if zom_col
            let dx = Math.sin((@rotation - 90) * 0.0174527778) * @speed
            let dy = Math.cos((@rotation - 90) * 0.0174527778) * @speed
            zom_col.position.x += dx * @speed
            zom_col.position.y -= dy * @speed
            @position.x -= dx
            @position.y += dy

    def playerColision
        if @distanceToPlayerX() < @size and @distanceToPlayerY() < @size
            @position.x -= Math.sin((state.player.rotation + 90) * 0.0174527778) * @speed
            @position.y += Math.cos((state.player.rotation + 90) * 0.0174527778) * @speed

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

    def colideZombie
        for zombie in state.zombies
            if @distanceToZombieX(zombie) < @size and @distanceToZombieY(zombie) < @size
                return zombie if zombie != self
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
