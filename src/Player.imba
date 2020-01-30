import {state} from './state'
import {Gun} from './Gun'

export class Player
    def constructor inventory
        @position = {x:0,y:0}
        @rotation = 0
        @inventory = inventory
        @reputation = 0
        @gun = @inventory[0]
        @speed = .5
        @nearZombies = Set.new

    def update
        @gun.update()
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
            '1': do @gun = @inventory[0] if @inventory[0]
            '2': do @gun = @inventory[1] if @inventory[1]
            '3': do @gun = @inventory[2] if @inventory[2]
            '4': do @gun = @inventory[3] if @inventory[3]
            '5': do @gun = @inventory[4] if @inventory[4]
            'R': do @gun.reload()
        }
        actions[key] and actions[key]()