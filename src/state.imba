import {Gun} from './Gun'
import {Player} from './Player'
import {Zombie} from './Zombie'

export var state = 
    time: 0
    keys: []
    mouse: {x: 0, y: 0}
    player: Player.new
    bullets: Set.new
    camera: {}
    sector: {}
    killed: Set.new
    delta: 2
    guns:
        rifle: Gun.new
    svg: 
        height: 1
        width: 1