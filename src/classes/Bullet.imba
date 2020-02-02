import {state} from '../state'

export class Bullet
    def constructor spread, damage, power, speed
        @spread = spread
        @damage = damage
        @power = power
        @speed = speed
        @position = {
            x: state.player.position.x + Math.cos((state.player.rotation) * 0.01745) * 5
            y: state.player.position.y + Math.sin((state.player.rotation) * 0.01745) * 5
        }
        @rotation = state.player.rotation + 90 + (Math.random() * spread - (spread/2))

    def update
        @checkColision()
        @position.x += Math.cos((@rotation) * 0.01745) * @speed * state.delta
        @position.y += Math.sin((@rotation) * 0.01745) * @speed * state.delta
        if @distanceToPlayerX() > window.innerWidth or @distanceToPlayerY() > window.innerHeight
            state.bullets.delete(self)

    def distanceToPlayerX
        Math.abs(state.player.position.x - @position.x)
    
    def distanceToPlayerY
        Math.abs(state.player.position.y - @position.y)

    def distanceToZombieX(zombie)
        Math.abs(zombie.position.x - @position.x)

    def distanceToZombieY(zombie)
        Math.abs(zombie.position.y - @position.y)

    def currentSector
        "{~~(@position.x / 800)}|{~~(@position.y / 800)}"

    def checkColision
        for zombie of state.sector[@currentSector()]
            if @distanceToZombieX(zombie) < zombie.size and @distanceToZombieY(zombie) < zombie.size
                state.bullets.delete(self)
                zombie.takeHit(self)
