import {state} from './state'

export class Player
    @position = {x:0,y:0}
    @rotation = 0
    @gun = state.guns.rifle
    @speed = .3

    def update
        @move()
        @rotate()
        @shoot()

    def shoot
        @gun.fire() if state.mouse.press

    def rotate
        let diffX = state.mouse.x - window.innerWidth/2
        let diffY = state.mouse.y - window.innerHeight/2
        @rotation = -Math.atan2(diffX, diffY) / 3.1415 * 180.0

    def move
        let slower
        if ((state.keys.A or 0) + (state.keys.D or 0) + (state.keys.W or 0) + (state.keys.S or 0)) > 1
            slower = 0.707
        else
            slower = 1

        @position.x -= @speed * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.A
        @position.x += @speed * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.D
        @position.y += @speed * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.W
        @position.y -= @speed * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.S