import {Game} from './classes/Game'
import {Gun} from './classes/Gun'
import {Player} from './classes/Player'
import {Zombie} from './classes/Zombie'
import {Obstacle} from './classes/Obstacle'

var guns = 
    [   #       cap,   rate,  spread, damage, power, projectiles, speed, reload_time,  name,               price
        Gun.new(6,     150,   6,      30,     15,    1,           8,     2000,         'revolver',         0)
        Gun.new(12,    280,   10,     13,     15,    1,           7,     1000,         'usp45',            500)
        Gun.new(7,     100,   20,     50,     30,    1,           8,     1400,         'desert eagle',     5000)
        Gun.new(30,    1000,  15,     13,     5,     1,           8,     1000,         'mp5',              10000)
        Gun.new(5,     60,    25,     12,     16,    6,           8,     2200,         'pump shotgun',     20000)
        Gun.new(15,    600,   20,     40,     20,    1,           12,    1500,         'ak47',             30000)
        Gun.new(25,    800,   15,     30,     15,    1,           13,    1200,         'm4a1',             33000)
        Gun.new(5,     60,    4,      100,    20,    1,           15,    1600,         'm95',              18000)
    ]
var player = Player.new([guns[0]])
let zombies = {} 
for i in [0..50000]
    let zombie = Zombie.new(player, 1)
    zombies[zombie.currentSector()] ||= Set.new
    zombies[zombie.currentSector()].add(zombie)


let obstacles = {}
for i in [0..10000]
    let ob = Obstacle.new
    obstacles[ob.currentSector()] ||= Set.new
    obstacles[ob.currentSector()].add(ob)

export var state = 
    game: Game
    time: 0
    keys: []
    mouse: {x: 0, y: 0}
    player: player
    bullets: Set.new
    camera: {}
    zombies: zombies
    killed: Set.new
    delta: 1
    day: 1
    obstacles: obstacles
    svg: 
        height: 1
        width: 1
    store: guns.slice(1,-1)
    shop: {
        guns: []
        upgrade-gun: null
        health: 500
        speed: 500
        stamina: 500
        slots: 5000
    }