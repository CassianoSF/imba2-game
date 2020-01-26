import {Bullet} from './Bullet'
import {state} from './state'

export class Gun
    @rate = 950

    def fire
        if state.time % ~~(10000 / @rate) == 0
            state.bullets.add(Bullet.new)
