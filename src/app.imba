import {state} from './state'
import './views/player-hud'
import './views/player-store'

tag app-root

    def build
        @animations = []
        @loadAnimations()

    def mount
        state.game.new(self)

    def cameraPosX
        window.innerWidth / 2 - state.player.position.x

    def cameraPosY
        window.innerHeight / 2 - state.player.position.y

    def transformCamera
        if state.time - state.player.gun.last_shot < 30
            let power = state.player.gun.power / 2
            let x = @cameraPosX() + Math.random() * power - power/2
            let y = @cameraPosY() + Math.random() * power - power/2
            "translate({x}, {y})"
        else
            "translate({@cameraPosX()}, {@cameraPosY()})"

    def transformPlayer
        "translate({state.player.position.x}, {state.player.position.y}) rotate({state.player.rotation})"

    def transformBullet bullet
        "translate({bullet.position.x}, {bullet.position.y}) rotate({bullet.rotation})"

    def transformZombie zombie
        "translate({zombie.position.x}, {zombie.position.y}) rotate({zombie.rotation})"

    def transformObstacle obs
        "translate({obs.position.x}, {obs.position.y}) rotate({obs.rotation})"


    def transformShopArrow
        let pos = state.player.position
        let rotation = -(Math.atan2(pos.x, pos.y)/0.01745 + 180) % 360
        "translate({pos.x}, {pos.y}) rotate({rotation})"



        # for own name, anim of state.animations.feet
        #     for a, i in Array.from(Array.new(anim.size))
        #         <svg:defs>
        #             <svg:pattern id="{anim.name}-{i}" patternUnits="userSpaceOnUse" width="100" height="100" patternContentUnits="userSpaceOnUse">
        #                 <svg:image href="{anim.path}{i}.png" width="100" height="100">

    def loadAnimations
        for own gun, anims of state.animations.player
            for own action, anim of anims
                for a, i in [0...anim.size]
                    @animations.push({
                        name: "{anim.name}-{i}"
                        path: "{anim.path}{i}"
                    })

    def render
        <self>
            <.ui>
                <player-hud>
                <player-store>
            <svg transform="scale(1,-1)" height="100%" width="100%">
                for animation in @animations
                    <defs>
                        <pattern id="{animation.name}" patternUnits="userSpaceOnUse" width="100" height="100" patternContentUnits="userSpaceOnUse">
                            <image href="{animation.path}.png" width="100" height="100">


                # CROSSHAIR
                <g transform="translate({state.mouse.x}, {state.mouse.y})">
                    <line y1=4 y2=10 stroke='#5F5'>
                    <line y1=-4 y2=-10 stroke='#5F5'>
                    <line x1=4 x2=10 stroke='#5F5'>
                    <line x1=-4 x2=-10 stroke='#5F5'>

                # CAMERA
                <g transform=@transformCamera() .fadeOut=(state.player.dead)>
                    for obs of state.player.nearObstacles
                        <g transform=@transformObstacle(obs)>
                            <circle r=obs.size fill="grey">

                    # SHOP ARROW
                    if state.player.distanceTo(0,0) > 600
                        <g transform=@transformShopArrow() .fadeIn>
                            <g transform="translate(0,250) scale(2,2)">
                                <path fill="rgba(0,255,0,0.4)" d="M0 0l0.93 0 0 21.69c1.42,-0.19 2.96,-1.19 5.18,-3l-5.68 9.66 -5.61 -9.78c2.2,1.91 3.7,2.97 5.18,3.13l0 -21.7z">

                    # PLAYER
                    <g transform=@transformPlayer()>
                        <circle r=10 fill="white">
                        <rect width=100 height=100 transform="scale(-.7,.7) rotate(90) translate(-50,-50)" fill="url(#handgun-idle-0)">

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
                            <circle r=(zombie.size) fill="red" stroke='black'>
                            <rect width=(zombie.size * 2) height="4" y="6" fill="red">
                            <rect width=(zombie.size * 2) height="4" y="-10" fill="red">

                    # BODIES
                    for zombie of state.killed
                        <g transform=@transformZombie(zombie) .fadeOut>
                            <circle r=(zombie.size) fill="grey" stroke='black'>
                            <rect width=(zombie.size * 2) height="4" y="6" fill="grey">
                            <rect width=(zombie.size * 2) height="4" y="-10" fill="grey">

                    # SHOP
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
        cursor: none;
    }

    app-root {
        display: block; 
        position: relative;
        background-color: black
    }

    @font-face {
        font-family: MenofNihilist;
        src: url(fonts/MenofNihilist.otf) format("opentype");
    }
    @font-face {
        font-family: Typewriter;
        src: url("fonts/JMH Typewriter-Black.otf") format("opentype");
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
        -webkit-animation-duration: 1.5s;
        animation-duration: 1.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeOut;
        animation-name: fadeOut
    }

    .fadeIn {
        -webkit-animation-duration: 1.5s;
        animation-duration: 1.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeIn;
        animation-name: fadeIn
    }

    .ui {
        position: fixed;
        z-index: 10;
    }
###