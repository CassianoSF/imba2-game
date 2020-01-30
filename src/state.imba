import {Gun} from './Gun'
import {Player} from './Player'
import {Zombie} from './Zombie'

var guns = 
    #                      cap,   rate,  spread, damage, power, projectiles, speed, reload_time
    revolver:      Gun.new(6,     150,   15,     30,     15,    1,           8,     2000)
    pistol:        Gun.new(10,    150,   15,     25,     10,    1,           8,     2000)
    mp5:           Gun.new(30,    1000,  15,     9,      5,     1,           8,     2000)
    ump:           Gun.new(25,    800,   17,     13,     8,     1,           7,     2000)
    ak:            Gun.new(20,    600,   20,     40,     20,    1,           12,    2000)
    m4:            Gun.new(25,    800,   15,     30,     15,    1,           13,    2000)
    pump_shotgun:  Gun.new(5,     60,    25,     15,     30,    10,          6,     2000)
    double_barrel: Gun.new(2,     300,   25,     30,     40,    10,          7,     2000)
    sniper:        Gun.new(6,     45,    5,      100,    20,    1,           14,    2000)


export var state = 
    time: 0
    keys: []
    mouse: {x: 0, y: 0}
    player: Player.new([guns.pistol, guns.m4])
    bullets: Set.new
    camera: {}
    sector: {}
    killed: Set.new
    delta: 2
    svg: 
        height: 1
        width: 1
    guns: guns