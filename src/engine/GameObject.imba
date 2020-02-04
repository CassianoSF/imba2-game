import {state} from '../state'

export class GameObject
    def constructor
        @position
        @rotation
        @size

    static def randomPosition player
        let posx = Math.random() * window.innerWidth * 30 - (window.innerWidth * 15)
        let posy = Math.random() * window.innerHeight * 30 - (window.innerHeight * 15)
        let diffx = Math.abs(posx - player.position.x)
        let diffy = Math.abs(posy - player.position.y)
        if diffx < 400 and diffy < 400
            return self.randomPosition(player)

        return {
            x: posx
            y: posy
        }

    def currentSector
        "{~~(@position.x / 1000)}|{~~(@position.y / 800)}"

    def colideCircle obj
        Math.sqrt(@distanceToObjectX(obj)**2 + @distanceToObjectY(obj)**2) < (@size + obj.size)

    def colideQuad obj
        @distanceToObjectX() < (obj.size + @size) and @distanceToObjectY() < (obj.size + @size)

    def distanceToObjectX obj
        Math.abs(obj.position.x - @position.x)

    def distanceToObjectY obj
        Math.abs(obj.position.y - @position.y)

    def moveForward
        @position.x -= Math.sin((@rotation - 90) * 0.01745) * state.delta * @speed
        @position.y += Math.cos((@rotation - 90) * 0.01745) * state.delta * @speed

    def angleToObject obj
        let dx = obj.position.x - @position.x
        let dy = obj.position.y - @position.y
        -(Math.atan2(dx, dy)/0.01745 - 90) % 360        
