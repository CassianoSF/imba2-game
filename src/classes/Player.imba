import {state} from '../state'

export class Player
    def constructor inventory
        @position = {x:0,y:0}
        @rotation = 0
        @inventory = inventory
        @score = 100000
        @gun = @inventory[0]
        @holsters = [@gun]
        @speed = .3
        @nearZombies = Set.new
        @life = 100
        @slots = 2

    def update
        return if @dead
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
        return if @isInSafeZone()
        @gun.fire() if state.mouse.press

    def rotate
        let diffX = state.mouse.x - window.innerWidth/2
        let diffY = state.mouse.y - window.innerHeight/2
        @rotation = -Math.atan2(diffX, diffY) * 57.2974694

    def move
        let slower
        if ((state.keys.KeyA or 0) + (state.keys.KeyD or 0) + (state.keys.KeyW or 0) + (state.keys.KeyS or 0)) > 1
            slower = 0.707
        else
            slower = 1

        @position.x -= @speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1) if state.keys.KeyA
        @position.x += @speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1) if state.keys.KeyD
        @position.y += @speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1) if state.keys.KeyW
        @position.y -= @speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1) if state.keys.KeyS


    def changeGun slot
        if @holsters[slot]
            @gun.reloading = false
            @gun = @holsters[slot]

    def onKeyEvent key
        let actions = {
            'Digit1': do @changeGun(0)
            'Digit2': do @changeGun(1)
            'Digit3': do @changeGun(2)
            'Digit4': do @changeGun(3)
            'Digit5': do @changeGun(4)
            'KeyR': do @gun.reload()
        }
        actions[key] and actions[key]()

    def takeHit damage
        return if @dead
        @life -= damage
        if @life <= 0
            @dead = true

    def isInSafeZone
        Math.abs(@position.x) < 50 and Math.abs(@position.y) < 50