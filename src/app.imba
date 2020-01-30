import {Zombie} from './Zombie'
import {state} from './state'

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
        state.player.checkAction(e.key.toUpperCase())
        state.keys[e.key.toUpperCase()] = true

    def keyupEvent e
        state.keys[e.key.toUpperCase()] = false

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
        "translate({window.innerWidth / 2 - state.player.position.x}, {window.innerHeight / 2 - state.player.position.y})"

    def transformPlayer
        "translate({state.player.position.x}, {state.player.position.y}) rotate({state.player.rotation})"

    def transformBullet bullet
        "translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})"

    def transformZombie zombie
        "translate({zombie.position.x}, {zombie.position.y}) rotate({zombie.rotation})"

    def render
        <self>
            <div style="position: fixed;color: red;font-size: 30px; z-index: 1;">
                'TEST'
            <svg transform="scale(1,-1)" height="100%" width="100%" style="background-color: black">
                <g transform=@transformCamera()>

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

                    for zombie of state.killed
                        <g transform=@transformZombie(zombie) .fadeOut>
                            <circle r=(zombie.size / 2) fill="grey" stroke='black'>
                            <rect width=(zombie.size) height="4" y="6" fill="grey">
                            <rect width=(zombie.size) height="4" y="-10" fill="grey">
                    <circle x="0" y="0" r=10 stroke="green" fill="rgba(0,0,0,0)">