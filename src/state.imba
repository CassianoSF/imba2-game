import {Gun} from './Gun'
import {Player} from './Player'
import {Zombie} from './Zombie'

var initial_state = {
    time: 0
    keys: []
    mouse: {x: 0, y: 0}
    player: Player.new
    bullets: Set.new
    zombies: Set.new
    camera: {}
    sector: {}
    guns: {
        rifle: Gun.new
    }
    svg: {
        height: 1
        width: 1
    }
}

export var state = initial_state