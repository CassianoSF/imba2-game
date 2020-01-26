import {Zombie} from './Zombie'
import {state} from './state'


tag app-root

    def refresh
        state.time++
        # console.time()
        @render()
        # console.timeEnd()
        # console.time()
        @update()
        # console.timeEnd()

    def mount
        state.svg = document.getElementById('svg').getBoundingClientRect()
        window.addEventListener('resize', @resizeEvent)
        window.addEventListener('keydown', @keydownEvent)
        window.addEventListener('keyup', @keyupEvent)
        window.addEventListener('mousemove', @mousemoveEvent)
        window.addEventListener('mousedown', @mousedownEvent)
        window.addEventListener('mouseup', @mouseupEvent)
        setInterval(@refresh.bind(this), 1)

        for i in [0..200]
            let z = Zombie.new
            state.sector["{~~(z.position.x / 100)}-{~~(z.position.y / 100)}"] ||= Set.new
            state.sector["{~~(z.position.x / 100)}-{~~(z.position.y / 100)}"].add(z)
            state.zombies.add(z)

    def resizeEvent e
        state.svg = @svg.getBoundingClientRect()

    def keydownEvent e
        state.keys[e.key.toLowerCase()] = true

    def keyupEvent e
        state.keys[e.key.toLowerCase()] = false

    def mousemoveEvent e
        state.mouse.x = e.clientX
        state.mouse.y = state.svg.height - e.clientY

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
        state.svg.width / 2 - state.player.position.x

    def cameraPosY
        state.svg.height / 2 - state.player.position.y

    def render test
        <self>
            <svg #svg transform="scale(1,-1)" height="100%" width="100%" style="background-color: black">
                <g transform="translate({@cameraPosX()}, {@cameraPosY()})">

                    # PLAYER
                    <g transform="translate({state.player.position.x}, {state.player.position.y}) rotate({state.player.rotation})">
                        <circle r=10 fill="white">

                        # GUN
                        <g transform='translate(5, 5)'>
                            <rect height=13 width=2 fill="white">

                    # BULLETS
                    for bullet of state.bullets
                        <g transform="translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})">
                            <rect width=50 height=1 fill="yellow">

                    # ZOMBIES
                    for zombie of state.zombies
                        <g transform="translate({zombie.position.x}, {zombie.position.y}) rotate({zombie.rotation})">
                            <circle r=(zombie.size / 2) fill="red" stroke='black'>
                            <rect width=(zombie.size) height=4 y="6" fill="red">
                            <rect width=(zombie.size) height=4 y="-10" fill="red">

                    <rect x="0" y="0" height=30 width=30 fill="green">