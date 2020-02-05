import {Animation} from './engine/Animation'

import {Game} from './classes/Game'
import {Gun} from './classes/Gun'
import {Player} from './classes/Player'
import {Zombie} from './classes/Zombie'
import {Obstacle} from './classes/Obstacle'

let animations = 
    player:
        knife:
            idle:   Animation.new
                path: "textures/knife/idle/survivor-idle_knife_"
                name: "knife-idle"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.15,1.15"
                    translate: "-5,0"

            move:   Animation.new
                path: "textures/knife/move/survivor-move_knife_"
                name: "knife-move"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.15,1.15"
                    translate: "-5,0"

            attack: Animation.new
                path: "textures/knife/meleeattack/survivor-meleeattack_knife_"
                name: "knife-meleeattack"
                size: 14
                frame-length: 2
                adjust: 
                    scale: "1.3,1.3"
                    translate: "-5,5"

        handgun:
            idle:   Animation.new
                path: "textures/handgun/idle/survivor-idle_handgun_"
                name: "handgun-idle"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1,1"
                    translate: "0,0"

            move:   Animation.new
                path: "textures/handgun/move/survivor-move_handgun_"
                name: "handgun-move"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1,1"
                    translate: "0,0"

            attack: Animation.new
                path: "textures/handgun/meleeattack/survivor-meleeattack_handgun_"
                name: "handgun-meleeattack"
                size: 14
                frame-length: 2
                adjust: 
                    scale: "1.2,1.2"
                    translate: "0,-5"

            shoot:  Animation.new
                path: "textures/handgun/shoot/survivor-shoot_handgun_"
                name: "handgun-shoot"
                size: 2
                frame-length: 3
                adjust: 
                    scale: "1,1"
                    translate: "0,0"

            reload: Animation.new
                path: "textures/handgun/reload/survivor-reload_handgun_"
                name: "handgun-reload"
                size: 14
                frame-length: 3
                adjust: 
                    scale: "1,1"
                    translate: "0,0"

        rifle:
            idle:   Animation.new
                path: "textures/rifle/idle/survivor-idle_rifle_"
                name: "rifle-idle"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            move:   Animation.new
                path: "textures/rifle/move/survivor-move_rifle_"
                name: "rifle-move"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            attack: Animation.new
                path: "textures/rifle/meleeattack/survivor-meleeattack_rifle_"
                name: "rifle-meleeattack"
                size: 14
                frame-length: 2
                adjust: 
                    scale: "1.45,1.45"
                    translate: "-5,-20"

            shoot:  Animation.new
                path: "textures/rifle/shoot/survivor-shoot_rifle_"
                name: "rifle-shoot"
                size: 2
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            reload: Animation.new
                path: "textures/rifle/reload/survivor-reload_rifle_"
                name: "rifle-reload"
                size: 14
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"
        shotgun:
            idle:   Animation.new
                path: "textures/shotgun/idle/survivor-idle_shotgun_"
                name: "shotgun-idle"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            move:   Animation.new
                path: "textures/shotgun/move/survivor-move_shotgun_"
                name: "shotgun-move"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            attack: Animation.new
                path: "textures/shotgun/meleeattack/survivor-meleeattack_shotgun_"
                name: "shotgun-meleeattack"
                size: 14
                frame-length: 2
                adjust: 
                    scale: "1.45,1.45"
                    translate: "-5,-20"

            shoot:  Animation.new
                path: "textures/shotgun/shoot/survivor-shoot_shotgun_"
                name: "shotgun-shoot"
                size: 2
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            reload: Animation.new
                path: "textures/shotgun/reload/survivor-reload_shotgun_"
                name: "shotgun-reload"
                size: 14
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

        flashlight:
            idle:   Animation.new
                path: "textures/flashlight/idle/survivor-idle_flashlight_"
                name: "flashlight-idle"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            move:   Animation.new
                path: "textures/flashlight/move/survivor-move_flashlight_"
                name: "flashlight-move"
                size: 19
                frame-length: 3
                adjust: 
                    scale: "1.25,1.25"
                    translate: "0,-10"

            attack: Animation.new
                path: "textures/flashlight/meleeattack/survivor-meleeattack_flashlight_"
                name: "flashlight-meleeattack"
                size: 14
                frame-length: 2
                adjust: 
                    scale: "1.25,1.25"
                    translate: "-5,-10"

    feet:
        idle:         Animation.new
            path: "textures/feet/idle/survivor-idle_"
            name: "feet-idle"
            size: 1
            frame-length: 3
            adjust: 
                scale: "0.9,0.9"
                translate: "0,10"

        run:          Animation.new
            path: "textures/feet/run/survivor-run_"
            name: "feet-run"
            size: 19
            frame-length: 3
            adjust: 
                scale: "0.9,0.9"
                translate: "0,10"

        walk:         Animation.new
            path: "textures/feet/walk/survivor-walk_"
            name: "feet-walk"
            size: 19
            frame-length: 3
            adjust: 
                scale: "0.9,0.9"
                translate: "0,10"

        strafe_left:  Animation.new
            path: "textures/feet/strafe_left/survivor-strafe_left_"
            name: "feet-strafe_left"
            size: 19
            frame-length: 3
            adjust: 
                scale: "0.9,0.9"
                translate: "0,10"

        strafe_right: Animation.new
            path: "textures/feet/strafe_right/survivor-strafe_right_"
            name: "feet-strafe_right"
            size: 19
            frame-length: 3
            adjust: 
                scale: "0.9,0.9"
                translate: "0,10"

    zombie:
        idle:    Animation.new
            path: "idle"
            size: 16
            frame-length: 3
            adjust: 
                scale: "1,1"
                translate: "0,0"

        attack:  Animation.new
            path: "attack"
            size: 8
            frame-length: 2
            adjust: 
                scale: "1.3,1.3"
                translate: "0,0"

        move:    Animation.new
            path: "move"
            size: 16
            frame-length: 3
            adjust: 
                scale: "1.3,1.3"
                translate: "0,0"








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
for i in [0..5000]
    let zombie = Zombie.new(player, 1)
    zombies[zombie.currentSector()] ||= Set.new
    zombies[zombie.currentSector()].add(zombie)


let obstacles = {}
for i in [0..10000]
    let ob = Obstacle.new(player)
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
        max-stamina: 500
        slots: 5000
    }
    animations: animations