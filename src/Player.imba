import {state} from './state'

export class Player
    @position = {x:0,y:0}
    @rotation = 0
    @gun = state.guns.rifle
    @speed = .5

    def update
        @move()
        @rotate()
        @shoot()

    def shoot
        @gun.fire() if state.mouse.press

    def rotate
        let diffX = state.mouse.x - state.svg.width/2
        let diffY = state.mouse.y - state.svg.height/2
        @rotation = -Math.atan2(diffX, diffY) / 3.1415 * 180.0

    def move
        let slower
        if state.keys.a + state.keys.d + state.keys.w + state.keys.s > 1
            slower = 0.7
        else
            slower = 1

        @position.x -= @speed * slower * (state.keys.shift ? 2 : 1) if state.keys.a
        @position.x += @speed * slower * (state.keys.shift ? 2 : 1) if state.keys.d
        @position.y += @speed * slower * (state.keys.shift ? 2 : 1) if state.keys.w
        @position.y -= @speed * slower * (state.keys.shift ? 2 : 1) if state.keys.s