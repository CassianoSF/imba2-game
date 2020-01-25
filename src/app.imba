import {Player} from './Player'
import {Zombie} from './Zombie'
import {state} from './state'

tag app-root
    @svg

    def mount
        state.svg = @svg.getBoundingClientRect()
        state.ready = true
        state.player = Player.new
        setInterval(&, 10) do state.time++
        setInterval(&, 16) do
            @update()
            @render()

        for i in [0..200]
            state.zombies.push(Zombie.new)

        window.addEventListener('resize', &) do |e|
            state.svg = @svg.getBoundingClientRect()

        window.addEventListener('keydown', &) do |e|
            state.keys[e.key] = true

        window.addEventListener('keyup', &) do |e|
            state.keys[e.key] = false

        window.addEventListener('mousemove', &) do |e|
            state.mouse.x = e.clientX
            state.mouse.y = state.svg.height - e.clientY

        window.addEventListener('mousedown', &) do |e|
            state.mouse.press = true

        window.addEventListener('mouseup', &) do |e|
            state.mouse.press = false


    def cameraPosX
        state.svg.width / 2 - state.player.position.x

    def cameraPosY
        state.svg.height / 2 - state.player.position.y

    def update
        if state.ready
            state.player.update()
            for zombie in state.zombies
                zombie.update()

    def render
        <self>
            @svg = 
                <svg transform="scale(1,-1)" height="100%" width="100%" style="background-color: black">
                    if state.ready
                        <g transform="translate({@cameraPosX()}, {@cameraPosY()})">

                            # PLAYER
                            <g transform="translate({state.player.position.x}, {state.player.position.y}) rotate({state.player.rotation})">
                                <circle r=10 fill="white">

                                # GUN
                                <g transform='translate(5, 5)'>
                                    <rect height=13 width=2 fill="white">

                            # BULLETS
                            for bullet in state.bullets
                                <g transform="translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})">
                                    <rect width=50 height=1 fill="yellow">

                            # ZOMBIES
                            for zombie in state.zombies
                                <g transform="translate({zombie.position.x}, {zombie.position.y}) rotate({zombie.rotation})">
                                    <circle r=(zombie.size / 2) fill="red">
                                    <rect width=(zombie.size) height=4 x=(-20) y="7" fill="red">
                                    <rect width=(zombie.size) height=4 x=(-20) y="-10" fill="red">

                            <rect x="0" y="0" height=30 width=30 fill="green">