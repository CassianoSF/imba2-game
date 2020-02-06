import {GameObject} from '../engine/GameObject'
import {state} from '../state'

let DRIFT = 0
let AGGRO = 1
let ATTACK = 2
let DEAD = 3

export class Zombie < GameObject
    def constructor player, day, animations
        super
        @player = player
        @position = GameObject.randomPosition(@player) 
        @rotation = Math.random() * 360
        @sector = "{~~(@position.x / 1000)}|{~~(@position.y / 800)}"
        @state = 0
        @speed = .2
        @base_speed = .2
        @max_speed = .6 + (day / 20)
        @size = 20
        @turn = 0
        @life = 50 + (day*3)
        @death = 0
        @animations = animations
        @animation = animations.idle
        @animation-state = 'idle'

    def update
        @updateSector()
        @checkColisions()
        if @state is DEAD   then @execDead()
        if @state is DRIFT  then @execDrift()
        if @state is AGGRO  then @execAggro()
        if @state is ATTACK then @execAttack()
        @animation = @animations[@animation-state]

    def execDead
        if state.time - @death > 5000
            state.killed.delete(self)
            delete self

    def execAttack
        @animation-state = 'attack'
        if not @start_attack
            @start_attack = state.time
        if state.time - @start_attack > 100 and @playerIsClose(@size * 2) and not @player_beaten
            @player_beaten = yes
            @player.takeHit(10)
        if state.time - @start_attack > 500
            @start_attack = no
            @player_beaten = no
            @speed = 0
            @state = AGGRO

    def execDrift
        @animation-state = 'move'
        if @playerDetected()
            @state = AGGRO
        if state.time % 200 == 0
            @turn = Math.floor(Math.random() * 2)
            @speed = Math.random() * @base_speed
        if state.time % 3 == 0
            if @turn == 0
                @rotation += Math.random() * 3
            elif @turn == 1
                @rotation -= Math.random() * 3
        @moveForward()

    def execAggro
        @animation-state = 'move'
        if @player.inSafeZone()
            @state = DRIFT
        if @playerIsClose(@size * 2.1)
            @state = ATTACK
        @speed += 0.01 unless @speed >= @max_speed
        @rotation = @angleToObject(@player)
        @moveForward()

    def findColision obj-sectors
        obj-sectors[@sector] ||= Set.new
        for obj of obj-sectors[@sector]
            if @colideCircle(obj)
                return obj unless obj is self
        return no

    def playerOnSight
        Math.abs((@angleToObject(@player) - @rotation) % 360) < 30

    def playerIsClose distance
        @distanceToObjectX(@player) < distance and @distanceToObjectY(@player) < distance

    def playerDetected
        (@playerOnSight() and @playerIsClose(750) or @playerIsClose(40)) and not @player.inSafeZone()

    def updateSector()
        let temp_sector = @currentSector()
        if temp_sector != @sector
            state.zombies[@sector] ||= Set.new
            state.zombies[@sector].delete(self)
            @sector = temp_sector
            state.zombies[@sector] ||= Set.new
            state.zombies[@sector].add(self)

    def checkColisions
        let obj = @findColision(state.obstacles)
        if obj
            let dx = Math.sin((@angleToObject(obj) + 90) * 0.01745) * @speed * state.delta
            let dy = Math.cos((@angleToObject(obj) + 90) * 0.01745) * @speed * state.delta
            @position.x -= dx * 1.5
            @position.y += dy * 1.5
        let zom_col = @findColision(state.zombies)
        if zom_col
            let dx = Math.sin((@angleToObject(zom_col) + 90) * 0.01745) * @speed * state.delta
            let dy = Math.cos((@angleToObject(zom_col) + 90) * 0.01745) * @speed * state.delta
            zom_col.position.x += dx * 0.5
            zom_col.position.y -= dy * 0.5
            @position.x -= dx
            @position.y += dy

    def takeHit(bullet)
        @position.x -= Math.sin((bullet.rotation - 90) * 0.01745) * bullet.power
        @position.y += Math.cos((bullet.rotation - 90) * 0.01745) * bullet.power
        @state = AGGRO
        @life -= bullet.damage
        @speed -= bullet.power / 30 unless @speed < 0
        if @life <= 0
            state.zombies[@sector].delete(self)
            state.killed.add(self)
            @state = DEAD
            @player.score += 90 + 10 * state.day
            @death = state.time