var state = {
    keys: []
    mouse: {x: 0, y: 0}
    bullets: []
}

class Gun
    @rate = 10000
    @busy

    def fire
        return if @busy
        @busy = true
        state.bullets.push(Bullet.new.fly())
        setTimeout(&, 60000/@rate) do
            @busy = false

class Player
    @position = {x: 0, y: 0}
    @rotation = 0
    @gun = Gun.new

    def init
        @position.x = state.boundings.width / 2
        @position.y = state.boundings.height / 2

    def update
        @move()
        @rotate()
        @shoot()

    def shoot()
        return unless state.mouse.press
        @gun.fire()

    def rotate
        @rotation = -Math.atan2(state.mouse.x - @position.x, state.mouse.y - @position.y) / 3.1415 * 180.0

    def move
        @position.x -= 1 if state.keys.a
        @position.x += 1 if state.keys.d
        @position.y += 1 if state.keys.w
        @position.y -= 1 if state.keys.s

    def render
        @update()
        <g transform="translate({@position.x}, {@position.y}) rotate({@rotation})">
            <circle r=8 fill="{state.mouse.press ? "white" : "green"}">
            <g transform='translate(5, 5)'>
                <rect height=10 width=2 fill="white">

class Bullet
    @position = {
        x: state.player.position.x + Math.cos((state.player.rotation) * 3.1415 / 180) * 5
        y: state.player.position.y + Math.sin((state.player.rotation) * 3.1415 / 180) * 5
    }
    @rotation = state.player.rotation + 90

    def fly
        setTimeout(&, 16) do
            @position.x += Math.cos((@rotation) * 3.1415 / 180) * 20
            @position.y += Math.sin((@rotation) * 3.1415 / 180) * 20
            if @distanceToPlayerX() > 1000 or @distanceToPlayerY() > 1000
                return @deleteBullet()
            @fly()
        return self

    def distanceToPlayerX
        Math.abs(state.player.position.x - @position.x)
    
    def distanceToPlayerY
        Math.abs(state.player.position.y - @position.y)

    def deleteBullet
        var index = state.bullets.indexOf(self)
        state.bullets.splice(index, 1) if (index != -1)

    def render
        <g transform="translate({@position.x}, {@position.y}) rotate({@rotation})">
            <rect height=10 width=1 fill="yellow">


tag app-root
    @container
    @player = Player.new

    def mount
        state.boundings = @container.getBoundingClientRect()
        state.ready = true
        state.player = @player
        @player.init()
        setInterval(&, 1) do
            self.render()

        window.addEventListener('keydown', &) do |e|
            state.keys[e.key] = true

        window.addEventListener('keyup', &) do |e|
            state.keys[e.key] = false

        window.addEventListener('mousemove', &) do |e|
            state.mouse.y = state.boundings.height - e.clientY
            state.mouse.x = e.clientX

        window.addEventListener('resize', &) do |e|
            state.boundings = @container.getBoundingClientRect()

        window.addEventListener('mousedown', &) do |e|
            state.mouse.press = true

        window.addEventListener('mouseup', &) do |e|
            state.mouse.press = false

    def render
        <self>
            @container = <svg transform="scale(1,-1)" height="100%" width="100%" style="background-color: black">
                if state.ready
                    @player.render()
                    for bullet in state.bullets
                        <g transform="translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})">
                            <rect width=10 height=1 fill="yellow">
