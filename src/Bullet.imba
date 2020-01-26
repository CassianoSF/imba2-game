import {state} from './state'

export class Bullet
    @position = {
        x: state.player.position.x + Math.cos((state.player.rotation) * 0.0174527778) * 5
        y: state.player.position.y + Math.sin((state.player.rotation) * 0.0174527778) * 5
    }
    @rotation = state.player.rotation + 90

    def update
        @checkColision()
        @position.x += Math.cos((@rotation) * 0.0174527778) * 15
        @position.y += Math.sin((@rotation) * 0.0174527778) * 15
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

    def checkColision
        for zombie of state.sector["{~~(@position.x / 100)}-{~~(@position.y / 100)}"]
            if @distanceToZombieX(zombie) < 10 and @distanceToZombieY(zombie) < 10
                state.bullets.delete(self)
                zombie.takeHit(self)
