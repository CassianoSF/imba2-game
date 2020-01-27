import {Gun} from './Gun'
import {Player} from './Player'
import {Zombie} from './Zombie'

export var state = 
    time: 0
    keys: []
    mouse: {x: 0, y: 0}
    player: Player.new
    bullets: Set.new
    zombies: Set.new
    camera: {}
    sector: {}
    delta: 2
    guns:
        rifle: Gun.new
    svg: 
        height: 1
        width: 1