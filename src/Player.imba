import {Gun} from './Gun'
import {state} from './state'

export class Player
    @position = {
        x: state.svg.width / 2
        y: state.svg.height / 2
    }
    @rotation = 0
    @gun = Gun.new
    @speed = 2

    def update
        @move()
        @rotate()
        @shoot()

    def shoot
        return unless state.mouse.press
        @gun.fire()

    def rotate
        let diffX = state.mouse.x - state.svg.width/2
        let diffY = state.mouse.y - state.svg.height/2
        @rotation = -Math.atan2(diffX, diffY) / 3.1415 * 180.0

    def move
        @position.x -= @speed if state.keys.a
        @position.x += @speed if state.keys.d
        @position.y += @speed if state.keys.w
        @position.y -= @speed if state.keys.s