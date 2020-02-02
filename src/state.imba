import {Gun} from './classes/Gun'
import {Player} from './classes/Player'
import {Zombie} from './classes/Zombie'
import {Game} from './classes/Game'

var guns = [
    #       cap,   rate,  spread, damage, power, projectiles, speed, reload_time,  name,               price
    Gun.new(6,     150,   15,     30,     15,    1,           8,     2000,         'revolver',         0)
    Gun.new(12,    170,   10,     13,     15,    1,           7,     1000,         'usp45',            2000)
    Gun.new(7,     100,   20,     50,     30,    1,           8,     1400,         'desert eagle',     5000)
    Gun.new(30,    1000,  15,     13,     5,     1,           8,     1000,         'mp5',              10000)
    Gun.new(25,    800,   17,     17,     8,     1,           7,     1000,         'ump',              15000)
    Gun.new(5,     60,    25,     12,     30,    6,           6,     2200,         'pump shotgun',     20000)
    Gun.new(2,     300,   25,     20,     40,    6,           7,     1800,         'double barrel',    22000)
    Gun.new(15,    600,   20,     40,     20,    1,           12,    1500,         'ak47',             30000)
    Gun.new(25,    800,   15,     30,     15,    1,           13,    1200,         'm4a1',             33000)
    Gun.new(10,    220,   6,      50,     15,    1,           14,    1500,         'dragunov',         15000)
    Gun.new(5,     60,    4,      100,    20,    1,           15,    1600,         'm95',              18000)
]

var player = Player.new(guns)

let sector = {} 
for i in [0..10000]
    let zombie = Zombie.new(player)
    sector[zombie.currentSector()] ||= Set.new
    sector[zombie.currentSector()].add(zombie)

export var state = 
    game: Game
    time: 0
    keys: []
    mouse: {x: 0, y: 0}
    player: player
    bullets: Set.new
    camera: {}
    sector: sector
    killed: Set.new
    delta: 1
    svg: 
        height: 1
        width: 1
    store: guns.slice(1,-1)
