import {GameObject} from '../engine/GameObject'

export class Obstacle < GameObject
    def constructor player
        super
        @position = GameObject.randomPosition(player)
        @rotation = Math.random() * 360
        @size = 10 + Math.random() * 40