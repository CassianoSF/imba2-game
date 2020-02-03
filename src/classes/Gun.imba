import {Bullet} from './Bullet'
import {state} from '../state'

export class Gun
    def constructor cap, rate, spread, damage, power, projectiles, speed, reload_time, name, price, penetration=1
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
        @name = name
        @price = price
        @penetration = penetration
        @upgrades = {}
        @upgrades.cap         = 100 + price / 10
        @upgrades.rate        = 100 + price / 10
        @upgrades.spread      = 100 + price / 10
        @upgrades.damage      = 100 + price / 10
        @upgrades.power       = 100 + price / 10
        @upgrades.reload_time = 100 + price / 10

    def fire
        return if @reloading
        if @ammo == 0
            @reload()
        elif state.time - @last_shot > 60000/@rate and @ammo > 0
            @ammo--
            @last_shot = state.time
            for i in [0...@projectiles]
                state.bullets.add(Bullet.new(@spread,@damage,@power,@speed,@penetration))

    def reload
        unless @ammo == @cap
            @reloading = @reload_time

    def update
        if @reloading
            @reloading -= state.delta*5
            if @reloading <= 0
                @reloading = false
                @ammo = @cap


