import {state} from './state'
import {Gun} from './Gun'

export class Player
    def constructor
        @position = {x:0,y:0}
        @rotation = 0
        @inventory = {
                            # rate, spread, damage, power, projectiles, speed
            pistol:  Gun.new(150,   15,     25,     10,    1,           7)
            smg:     Gun.new(1000,  15,     9,      5,     1,           7)
            ak:      Gun.new(600,   20,     40,     15,    1,           12)
            shotgun: Gun.new(60,    25,     15,     30,    10,          6)
            sniper:  Gun.new(45,     5,     100,    20,    1,           14)
        }
        @gun = @inventory.pistol
        @speed = .5
        @nearZombies = Set.new

    def update
        @move()
        @rotate()
        @shoot()
        let x = ~~((@position.x - 899) / 1800)
        let y = ~~((@position.y - 899) / 1800)

        @nearZombies.clear()
        for val of (state.sector["{x + 0}|{y + 0}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 0}|{y + 1}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 1}|{y + 1}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 1}|{y + 0}"])
            @nearZombies.add(val)

    def shoot
        @gun.fire() if state.mouse.press

    def rotate
        let diffX = state.mouse.x - window.innerWidth/2
        let diffY = state.mouse.y - window.innerHeight/2
        @rotation = -Math.atan2(diffX, diffY) * 57.2974694

    def move
        let slower
        if ((state.keys.A or 0) + (state.keys.D or 0) + (state.keys.W or 0) + (state.keys.S or 0)) > 1
            slower = 0.707
        else
            slower = 1

        @position.x -= @speed * state.delta * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.A
        @position.x += @speed * state.delta * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.D
        @position.y += @speed * state.delta * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.W
        @position.y -= @speed * state.delta * slower * (state.keys.SHIFT ? 2 : 1) if state.keys.S


    def checkAction key
        let actions = {
            '1': do @gun = @inventory.pistol
            '2': do @gun = @inventory.smg
            '3': do @gun = @inventory.ak
            '4': do @gun = @inventory.shotgun
            '5': do @gun = @inventory.sniper
        }
        actions[key] and actions[key]()