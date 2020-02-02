import {state} from '../state'

export class Game
    def constructor renderer
        @renderer = renderer
        state.first_date = Date.new
        window.addEventListener('keydown', @keydownEvent)
        window.addEventListener('keyup', @keyupEvent)
        window.addEventListener('mousemove', @mousemoveEvent)
        window.addEventListener('mousedown', @mousedownEvent)
        window.addEventListener('mouseup', @mouseupEvent)
        setInterval(@update.bind(this), 16)

    def update
        let current_date = Date.new
        state.delta = (current_date - (state.last_date or Date.new)) / 5
        state.time = current_date - state.first_date
        state.last_date = current_date
        console.log state.delta if state.delta > 4
        state.player.update()

        for bullet of state.bullets
            bullet.update() if bullet

        for zombie of state.player.nearZombies
            zombie.update() if zombie

        for zombie of state.killed
            zombie.update() if zombie

        @renderer.render()

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