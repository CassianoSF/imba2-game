import {Zombie} from './classes/Zombie'
import {state} from './state'
import player-hud    from './tags/player-hud'

tag app-root

    def refresh
        @frames++
        let current_date = Date.new
        state.delta = (current_date - (state.last_date or Date.new)) / 5
        state.time = current_date - state.first_date
        @render()
        @update()
        state.last_date = current_date

    def mount
        state.first_date = Date.new
        window.addEventListener('keydown', @keydownEvent)
        window.addEventListener('keyup', @keyupEvent)
        window.addEventListener('mousemove', @mousemoveEvent)
        window.addEventListener('mousedown', @mousedownEvent)
        window.addEventListener('mouseup', @mouseupEvent)
        for i in [0..30000]
            let zombie = Zombie.new
            zombie.update()
            state.sector[zombie.currentSector()] ||= Set.new
            state.sector[zombie.currentSector()].add(zombie)
        @update()
        @update()
        setInterval(@refresh.bind(this), 16)

    def keydownEvent e
        state.player.onKeyEvent(e.code)
        state.keys[e.code] = true

    def keyupEvent e
        state.keys[e.code] = false

    def mousemoveEvent e
        state.mouse.x = e.clientX
        state.mouse.y = window.innerHeight - e.clientY

    def mousedownEvent e
        state.mouse.press = true

    def mouseupEvent e
        state.mouse.press = false

    def update
        state.player.update()
        if state.delta < 16
            for zombie of state.player.nearZombies
                zombie.update() if zombie
        for bullet of state.bullets
            bullet.update() if bullet

        for zombie of state.killed
            zombie.update() if zombie

    def cameraPosX
        window.innerWidth / 2 - state.player.position.x

    def cameraPosY
        window.innerHeight / 2 - state.player.position.y

    def transformCamera
        if state.time - state.player.gun.last_shot < 30
            let power = state.player.gun.power / 2
            let x = window.innerWidth / 2 - state.player.position.x + Math.random() * power - power/2
            let y = window.innerHeight / 2 - state.player.position.y + Math.random() * power - power/2
            "translate({x}, {y})"
        else
            "translate({window.innerWidth / 2 - state.player.position.x}, {window.innerHeight / 2 - state.player.position.y})"

    def transformPlayer
        "translate({state.player.position.x}, {state.player.position.y}) rotate({state.player.rotation})"

    def transformBullet bullet
        "translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})"

    def transformZombie zombie
        "translate({zombie.position.x}, {zombie.position.y}) rotate({zombie.rotation})"

    def render
        <self>
            <player-hud>
            <svg transform="scale(1,-1)" height="100%" width="100%" style="background-color: black" >
                # CROSSHAIR
                <g transform="translate({state.mouse.x}, {state.mouse.y})">
                    <line y1=4 y2=10 stroke='#AFA'>
                    <line y1=-4 y2=-10 stroke='#AFA'>
                    <line x1=4 x2=10 stroke='#AFA'>
                    <line x1=-4 x2=-10 stroke='#AFA'>

                # CAMERA
                <g transform=@transformCamera() .fadeOut=(state.player.dead)>

                    # PLAYER
                    <g transform=@transformPlayer()>
                        <circle r="10" fill="white">

                        # GUN
                        <g transform='translate(5, 5)'>
                            <rect height="13" width="2" fill="white">

                    # BULLETS
                    for bullet of state.bullets
                        <g transform=@transformBullet(bullet)>
                            <rect width="50" height="1" fill="yellow">

                    # ZOMBIES
                    for zombie of state.player.nearZombies
                        <g transform=@transformZombie(zombie)>
                            <circle r=(zombie.size / 2) fill="red" stroke='black'>
                            <rect width=(zombie.size) height="4" y="6" fill="red">
                            <rect width=(zombie.size) height="4" y="-10" fill="red">

                    # BODIES
                    for zombie of state.killed
                        <g transform=@transformZombie(zombie) .fadeOut>
                            <circle r=(zombie.size / 2) fill="grey" stroke='black'>
                            <rect width=(zombie.size) height="4" y="6" fill="grey">
                            <rect width=(zombie.size) height="4" y="-10" fill="grey">

                    # SAFE ZONE
                    <circle x="0" y="0" r=50 stroke="green" fill="rgba(0,255,0,0.1)">



### css

    body {
        margin: 0px;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    app-root {
        display: block; 
        position: relative;
        background-color: black
        cursor: none;
    }

    @font-face {
        font-family: MenofNihilist;
        src: url(./fonts/MenofNihilist-Regular.otf) format("opentype");
    }

    @keyframes fadeOut {
        0% {
            opacity: 1
        }
        to {
            opacity: 0
        }
    }


    @keyframes fadeIn {
        0% {
            opacity: 0
        }
        to {
            opacity: 1
        }
    }

    .fadeOut {
        -webkit-animation-duration: 2.5s;
        animation-duration: 2.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeOut;
        animation-name: fadeOut
    }

    .fadeIn {
        -webkit-animation-duration: 2.5s;
        animation-duration: 2.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeIn;
        animation-name: fadeIn
    }
###