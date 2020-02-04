import {GameObject} from '../engine/GameObject'
import {state} from '../state'

export class Player < GameObject
    def constructor inventory
        super
        @position = {x:0,y:0}
        @rotation = 0
        @size = 10
        @inventory = inventory
        @score = 100000
        @gun = @inventory[0]
        @holsters = [@gun]
        @speed = 0
        @max-speed = 1
        @nearZombies = Set.new
        @nearObstacles = Set.new
        @max-life = 50
        @life = 5000
        @slots = 1
        @safe = true
        @stamina = 300
        @max-stamina = 500

    def checkShop
        state.shop.open = false unless @inSafeZone()

    def update
        return if @dead
        @gun.update()
        @move()
        @rotate()
        @shoot()
        @updateNearObjects(state.obstacles, @nearObstacles)
        @updateNearObjects(state.zombies, @nearZombies)
        @checkColision(state.obstacles)
        @checkColision(state.zombies)
        @checkShop()

    def updateNearObjects obj-sectors,prop-set
        let x = ~~((@position.x) / 1000)
        let y = ~~((@position.y) / 800)
        prop-set.clear()
        for i in [-1..1]
            for j in [-1..1]
                for val of (obj-sectors["{x + i}|{y + j}"])
                    prop-set.add(val)

    def shoot
        return if @inSafeZone()
        @gun.fire() if state.mouse.press

    def rotate
        let diffX = state.mouse.x - window.innerWidth/2
        let diffY = state.mouse.y - window.innerHeight/2
        @rotation = -Math.atan2(diffX, diffY) * 57.2974694

    def move
        let slower
        let key-count = (~~state.keys.KeyA + ~~state.keys.KeyD + ~~state.keys.KeyW + ~~state.keys.KeyS)

        # Aceleration
        if key-count and state.keys.ShiftLeft and @stamina
            @stamina--
            @speed += 0.01 unless @speed >= @max-speed 
        elif key-count
            @stamina++ unless (@stamina >= @max-stamina or state.keys.ShiftLeft)
            @speed += 0.01 unless @speed >= @max-speed / 2
            @speed -= 0.01 if     @speed >= @max-speed / 2
        else
            @stamina++ unless (@stamina >= @max-stamina or state.keys.ShiftLeft)
            @speed = 0

        # Diagonal correction
        if ((state.keys.KeyA or 0) + (state.keys.KeyD or 0) + (state.keys.KeyW or 0) + (state.keys.KeyS or 0)) > 1
            slower = 0.707
        else
            slower = 1

        @position.x -= @speed * state.delta * slower if state.keys.KeyA
        @position.x += @speed * state.delta * slower if state.keys.KeyD
        @position.y += @speed * state.delta * slower if state.keys.KeyW
        @position.y -= @speed * state.delta * slower if state.keys.KeyS

    def checkColision obj-sectors
        obj-sectors[@currentSector()] ||= Set.new
        for obj of obj-sectors[@currentSector()]
            if @colideCircle(obj)
                @position.x -= Math.sin((@angleToObject(obj) + 90) * 0.01745) * ((obj.speed * 1.5) or @speed) * state.delta * 1.8
                @position.y += Math.cos((@angleToObject(obj) + 90) * 0.01745) * ((obj.speed * 1.5) or @speed) * state.delta * 1.8

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