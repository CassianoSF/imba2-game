import {Zombie} from './Zombie'
import {state} from './state'

tag app-root

    def refresh
        state.time++
        # console.time()
        let date = Date.new
        @render()
        let diff = Date.new - date
        console.log('slow render',diff) if diff > 5
        # console.timeEnd()
        date = Date.new
        @update()
        diff = Date.new - date
        console.log('slow update',diff) if diff > 5
        # console.timeEnd()

    def mount
        window.addEventListener('resize', @resizeEvent)
        window.addEventListener('keydown', @keydownEvent)
        window.addEventListener('keyup', @keyupEvent)
        window.addEventListener('mousemove', @mousemoveEvent)
        window.addEventListener('mousedown', @mousedownEvent)
        window.addEventListener('mouseup', @mouseupEvent)

        for i in [0...500]
            state.zombies.add(Zombie.new)

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
        for zombie of state.zombies
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
                    <g transform="translate({state.player.position.x}, {state.player.position.y}) rotate({state.player.rotation})">
                        <circle r="10" fill="white">

                        # GUN
                        <g transform='translate(5, 5)'>
                            <rect height="13" width="2" fill="white">

                    # BULLETS
                    for bullet of state.bullets
                        <g transform="translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})">
                            <rect width="50" height="1" fill="yellow">

                    # ZOMBIES
                    for zombie of state.zombies
                        <g transform="translate({zombie.position.x}, {zombie.position.y}) rotate({zombie.rotation})">
                            <circle r=(zombie.size / 2) fill="red" stroke='black'>
                            <rect width=(zombie.size) height="4" y="6" fill="red">
                            <rect width=(zombie.size) height="4" y="-10" fill="red">

                    <rect x="0" y="0" height="30" width="30" fill="green">