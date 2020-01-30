import {Bullet} from './Bullet'
import {state} from './state'

export class Gun
    def constructor rate, spread, damage, power, projectiles, speed
        @rate = rate
        @spread = spread
        @damage = damage
        @power = power
        @last_shot = 0
        @projectiles = projectiles
        @speed = speed

    def fire
        if state.time - @last_shot > 60000/@rate
            @last_shot = state.time
            for i in [0...@projectiles]
                state.bullets.add(Bullet.new(@spread,@damage,@power,@speed))
