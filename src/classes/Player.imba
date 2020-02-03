import {state} from '../state'

export class Player
    def constructor inventory
        @position = {x:0,y:0}
        @rotation = 0
        @inventory = inventory
        @score = 50
        @gun = @inventory[0]
        @holsters = [@gun]
        @speed = .4
        @nearZombies = Set.new
        @max-life = 50
        @life = 50
        @slots = 2
        @safe = true

    def checkShop
        state.shop.open = false unless @inSafeZone()

    def update
        return if @dead
        @gun.update()
        @move()
        @rotate()
        @shoot()
        @checkShop()
        let x = ~~((@position.x) / 800)
        let y = ~~((@position.y) / 800)

        @nearZombies.clear()
        for val of (state.sector["{x + 0}|{y + 0}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 0}|{y + 1}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 1}|{y + 1}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 1}|{y + 0}"])
            @nearZombies.add(val)
        for val of (state.sector["{x - 1}|{y + 0}"])
            @nearZombies.add(val)
        for val of (state.sector["{x - 1}|{y - 1}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 0}|{y - 1}"])
            @nearZombies.add(val)
        for val of (state.sector["{x + 1}|{y - 1}"])
            @nearZombies.add(val)
        for val of (state.sector["{x - 1}|{y + 1}"])
            @nearZombies.add(val)

    def shoot
        return if @inSafeZone()
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

    def inSafeZone
        Math.abs(@position.x) < 50 and Math.abs(@position.y) < 50

    def usingGun gun
        @holsters.find(do |g| g == gun)


    def equip gun
        return if @holsters.find(do |g| g == gun)
        if @holsters[@slots - 1]
            @holsters.pop()
        @holsters.unshift(gun)
        @gun = gun