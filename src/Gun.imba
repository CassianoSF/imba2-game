import {Bullet} from './Bullet'
import {state} from './state'

export class Gun
    def constructor cap, rate, spread, damage, power, projectiles, speed, reload_time
        @rate = rate
        @spread = spread
        @damage = damage
        @power = power
        @last_shot = 0
        @projectiles = projectiles
        @speed = speed
        @reload_time = reload_time
        @cap = cap    
        @ammo = @cap
        @reloading = false

    def fire
        console.log not @reloading
        if state.time - @last_shot > 60000/@rate and @ammo > 0 and not @reloading
            @ammo--
            @last_shot = state.time
            for i in [0...@projectiles]
                state.bullets.add(Bullet.new(@spread,@damage,@power,@speed))

    def reload
        unless @ammo == @cap
            @reloading = state.time

    def update
        if @reloading and (state.time - @reloading) > @reload_time
            @reloading = false
            @ammo = @cap


