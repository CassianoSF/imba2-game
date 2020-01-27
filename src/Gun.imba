import {Bullet} from './Bullet'
import {state} from './state'

export class Gun
    @rate = 600
    @last_shot = 0

    def fire
        if state.time - @last_shot > 60000/@rate
            @last_shot = state.time
            state.bullets.add(Bullet.new)
