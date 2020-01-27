import {Zombie} from './Zombie'
import {state} from './state'

tag app-root

    def refresh
        let current_date = Date.new
        state.delta = (current_date - (state.last_date or Date.new)) / 5
        state.time = current_date - state.first_date
        console.log state.delta if state.delta > 10
        if current_date - state.last_date > 16
            @render()
        @update()
        state.last_date = current_date

    def mount
        state.first_date = Date.new
        window.addEventListener('resize', @resizeEvent)
        window.addEventListener('keydown', @keydownEvent)
        window.addEventListener('keyup', @keyupEvent)
        window.addEventListener('mousemove', @mousemoveEvent)
        window.addEventListener('mousedown', @mousedownEvent)
        window.addEventListener('mouseup', @mouseupEvent)
        for i in [0...5000]
            let zombie = Zombie.new
            state.zombies.add(zombie)
            zombie.update()
            state.sector[zombie.currentSector()].add(zombie)

        setInterval(@refresh.bind(this), 1)

    def keydownEvent e
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
        for zombie of state.player.nearZombies()
            zombie.update() if zombie
        for bullet of state.bullets
            bullet.update() if bullet

    def cameraPosX
        window.innerWidth / 2 - state.player.position.x

    def cameraPosY
        window.innerHeight / 2 - state.player.position.y

    def render
        <self>
            <svg transform="scale(1,-1)" height="100%" width="100%" style="background-color: black">
                <g transform="translate({@cameraPosX()}, {@cameraPosY()})">

                    # PLAYER
                    <g transform="translate({state.player.position.x.toFixed(1)}, {state.player.position.y.toFixed(1)}) rotate({state.player.rotation.toFixed(1)})">
                        <circle r="10" fill="white">

                        # GUN
                        <g transform='translate(5, 5)'>
                            <rect height="13" width="2" fill="white">

                    # BULLETS
                    for bullet of state.bullets
                        <g transform="translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})">
                            <rect width="50" height="1" fill="yellow">

                    # ZOMBIES
                    for zombie of state.player.nearZombies()
                        <g transform="translate({zombie.position.x.toFixed(1)}, {zombie.position.y.toFixed(1)}) rotate({zombie.rotation.toFixed(1)})">
                            <circle r=(zombie.size / 2) fill="red" stroke='black'>
                            <rect width=(zombie.size) height="4" y="6" fill="red">
                            <rect width=(zombie.size) height="4" y="-10" fill="red">

                    <circle x="0" y="0" r=10 stroke="green" fill="rgba(0,0,0,0)">