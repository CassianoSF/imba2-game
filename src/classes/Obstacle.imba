import {GameObject} from '../engine/GameObject'

export class Obstacle < GameObject
    def constructor
        super
        @position = {
            x: 10000 - Math.random() * 20000
            y: 10000 - Math.random() * 20000
        }
        @rotation = Math.random() * 360
        @size = 10 + Math.random() * 40