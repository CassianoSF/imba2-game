import {Bullet} from './Bullet'
import {state} from './state'

export class Gun
    @rate = 800
    @busy

    def fire
        return if @busy
        @busy = true
        state.bullets.push(Bullet.new.fly())
        setTimeout(&, 60000/@rate) do
            @busy = false