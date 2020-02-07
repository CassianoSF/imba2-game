import {GameObject} from '../engine/GameObject'
import {state} from '../state'

export class Bullet < GameObject
    def constructor spread, damage, power, speed, penetration
        super
        @spread = spread
        @damage = damage
        @power = power
        @speed = speed
        @penetration = penetration
        @position = {
            x: state.player.position.x + Math.cos((state.player.rotation + 60) * 0.01745) * 30
            y: state.player.position.y + Math.sin((state.player.rotation + 60) * 0.01745) * 30
        }
        @rotation = state.player.rotation + 90 + (Math.random() * spread - (spread/2))

    def update
        @checkColision()
        @position.x += Math.cos((@rotation) * 0.01745) * @speed * state.delta
        @position.y += Math.sin((@rotation) * 0.01745) * @speed * state.delta
        if @distanceToObjectX(state.player) > window.innerWidth or @distanceToObjectY(state.player) > window.innerHeight
            state.bullets.delete(self)

    def checkColision
        for zombie of state.zombies[@currentSector()]
            if @distanceToObjectX(zombie) < (@speed*2) and @distanceToObjectY(zombie) < (@speed*2)
                zombie.takeHit(self)
                @penetration--
                if @penetration <= 0
                    state.bullets.delete(self)
