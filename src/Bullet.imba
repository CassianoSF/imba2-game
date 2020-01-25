import {state} from './state'

export class Bullet
    @position = {
        x: state.player.position.x + Math.cos((state.player.rotation) * 0.0174527778) * 5
        y: state.player.position.y + Math.sin((state.player.rotation) * 0.0174527778) * 5
    }
    @rotation = state.player.rotation + 90

    def fly
        @checkColision()
        @position.x += Math.cos((@rotation) * 0.0174527778) * 20
        @position.y += Math.sin((@rotation) * 0.0174527778) * 20
        if @distanceToPlayerX() > state.svg.width or @distanceToPlayerY() > state.svg.height
            @deleteBullet()
            return 
        setTimeout(&, 5) do
            @fly()
        return self

    def distanceToPlayerX
        Math.abs(state.player.position.x - @position.x)
    
    def distanceToPlayerY
        Math.abs(state.player.position.y - @position.y)

    def distanceToZombieX(zombie)
        Math.abs(zombie.position.x - @position.x)

    def distanceToZombieY(zombie)
        Math.abs(zombie.position.y - @position.y)

    def checkColision
        for zombie in state.zombies
            if @distanceToZombieX(zombie) < 10 && @distanceToZombieY(zombie) < 10
                @deleteBullet()
                zombie.takeHit(self)
                return true
        return false

    def deleteBullet
        var index = state.bullets.indexOf(self)
        state.bullets.splice(index, 1) if (index != -1)
