import {Zombie} from './Zombie'
import {state} from './state'

tag app-root
    @zombies
    @circles = []

    def refresh
        @render()
        @update()
        let current_date = Date.new
        state.delta = (current_date - (state.last_date or Date.new)) / 5
        state.time = current_date - state.first_date
        console.log state.delta if state.delta > 16
        state.last_date = current_date

    def mount
        state.first_date = Date.new
        window.addEventListener('keydown', @keydownEvent)
        window.addEventListener('keyup', @keyupEvent)
        window.addEventListener('mousemove', @mousemoveEvent)
        window.addEventListener('mousedown', @mousedownEvent)
        window.addEventListener('mouseup', @mouseupEvent)

        for x in [-100..+100]
            for y in [-100..+100]
                state.sector["{x}|{y}"] = Set.new

        for i in [0...5000]
            let zombie = Zombie.new
            state.zombies.add(zombie)
            zombie.update()
            state.sector[zombie.currentSector()].add(zombie)

        @update()
        @update()
        setInterval(@refresh.bind(this), 1)

    def update
        let circ
        state.player.update()
        for zombie of state.player.nearZombies
            zombie.update() if zombie
        for bullet of state.bullets
            bullet.update() if bullet
        for zombie, index in Array.from(state.player.nearZombies)
            if @circles[index]
                @circles[index].transform.baseVal.getItem(0).setTranslate(zombie.position.x,zombie.position.y)
            else
                @circles[index] ||= document.createElementNS("http://www.w3.org/2000/svg", "circle")
                @circles[index].setAttribute('transform', "translate(0,0)")
                @circles[index].setAttribute('fill', 'red')
                @circles[index].setAttribute('r', '10')
                @zombies.appendChild(@circles[index])
        let zombies_size = state.player.nearZombies.size
        let circles_size = @circles.length

        if circles_size > zombies_size
            for i in [zombies_size...circles_size]
                @zombies.removeChild(@circles.pop())

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

    def cameraPosX
        window.innerWidth / 2 - state.player.position.x

    def cameraPosY
        window.innerHeight / 2 - state.player.position.y

    def transformCamera
        "translate({window.innerWidth / 2 - state.player.position.x.toFixed(1)}, {window.innerHeight / 2 - state.player.position.y.toFixed(1)})"

    def transformPlayer
        "translate({state.player.position.x.toFixed(1)}, {state.player.position.y.toFixed(1)}) rotate({state.player.rotation.toFixed(1)})"

    def transformBullet bullet
        "translate({bullet.position.x.toFixed(1)}, {bullet.position.y.toFixed(1)}) rotate({bullet.rotation.toFixed(1)})"

    def transformZombie zombie
        "translate({zombie.position.x.toFixed(1)}, {zombie.position.y.toFixed(1)}) rotate({zombie.rotation.toFixed(1)})"


    def render
        <self>
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

                    @zombies = <g>


                    <circle x="0" y="0" r=10 stroke="green" fill="rgba(0,0,0,0)">