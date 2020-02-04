import {state} from '../state'

tag player-hud
    def render
        <self>
            <.fadeOut=(state.player.dead) .fadeIn=(!state.player.dead)>
                <.hud.stamina css:font-size="20px">
                    "Stamina "
                    <b>
                        "{~~(state.player.stamina / state.player.max-stamina * 100)}%"
                <.hud.score>
                    "score "
                    <b css:font-size="50px">
                        state.player.score
                <.hud.life>
                    "Life "
                    <b css:font-size="50px">
                        state.player.life
                    
                <.hud.slots .select-slot=(@selected_gun)>
                    for i in [0...state.player.slots]
                        <.onHand=(state.player.gun == state.player.holsters[i])>
                            "{i + 1}. {((state.player.holsters[i] or {}).name or '')}"
                <.hud.ammo>
                    <b css:font-size="50px">
                        "{state.player.gun.ammo}/{state.player.gun.cap}"
                    " Ammo"
            if state.player.dead
                <div .you-died .fadeIn>
                    "you died"

### css scoped
    .you-died {
        left: 33%
        top: 20%
        font-size: 15vw;
        color: #900;
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
    }

    .hud {
        position: fixed;
        z-index: 1;
        font-family: Typewriter;
        color: white;
    }
    .stamina {
        bottom: 10%;
        right: 2%;
        font-size: 15px;
    }

    .score {
        top: 2%;
        right: 2%;
        font-size: 30px;
    }

    .life {
        bottom: 2%;
        right: 2%;
        font-size: 30px;
    }
    .slots {
        left: 2%;
        bottom: 10%;
        font-size: 16px;
    }

    .select-slot {
        color: green
    }

    .ammo {
        bottom: 2%;
        left: 2%;
        font-size: 30px;
    }

    .onHand { 
        color: yellow
    }
###