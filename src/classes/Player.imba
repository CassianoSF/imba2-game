import {state} from '../state'

export class Player
    def constructor inventory
        @position = {x:0,y:0}
        @rotation = 0
        @inventory = inventory
        @score = 100000
        @gun = @inventory[0]
        @holsters = [@gun]
        @speed = .4
        @nearZombies = Set.new
        @nearObstacles = Set.new
        @max-life = 50
        @life = 5000
        @slots = 1
        @safe = true

    def checkShop
        state.shop.open = false unless @inSafeZone()

    def currentSector
        "{~~(@position.x / 1000)}|{~~(@position.y / 800)}"

    def update
        return if @dead
        @gun.update()
        @move()
        @rotate()
        @shoot()
        @checkShop()
        @updateNearZombies()
        @updateNearObstacles()

    def updateNearObstacles
        let x = ~~((@position.x) / 1000)
        let y = ~~((@position.y) / 800)
        @nearObstacles.clear
        for val of (state.obstacles["{x + 0}|{y + 0}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x + 0}|{y + 1}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x + 1}|{y + 1}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x + 1}|{y + 0}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x - 1}|{y + 0}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x - 1}|{y - 1}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x + 0}|{y - 1}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x + 1}|{y - 1}"])
            @nearObstacles.add(val)
        for val of (state.obstacles["{x - 1}|{y + 1}"])
            @nearObstacles.add(val)

    def updateNearZombies
        let x = ~~((@position.x) / 1000)
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
        @checkColision()

    def checkColision
        state.obstacles[@currentSector()] ||= Set.new
        for obs of state.obstacles[@currentSector()]
            if Math.sqrt(@distanceToObjectX(obs)**2 + @distanceToObjectY(obs)**2) < (10 + obs.size)
                let dx = Math.sin((@angleToObject(obs) + 90) * 0.01745) * @speed * state.delta
                let dy = Math.cos((@angleToObject(obs) + 90) * 0.01745) * @speed * state.delta
                @position.x -= dx * 1.8
                @position.y += dy * 1.8

    def distanceToObjectX obj
        Math.abs(obj.position.x - @position.x)

    def distanceToObjectY obj
        Math.abs(obj.position.y - @position.y)

    def angleToObject obj
        let dx = obj.position.x - @position.x
        let dy = obj.position.y - @position.y
        -(Math.atan2(dx, dy)/0.01745 - 90) % 360        


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