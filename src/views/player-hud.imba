import {state} from '../state'

tag player-hud
    def render
        <self>
            <div .fadeOut=(state.player.dead)>
                <div .ui.score>
                    "score "
                    <b css:font-size="50px">
                        state.player.score
                <div .ui.life>
                    "Life "
                    <b css:font-size="50px">
                        state.player.life
                    
                <div .ui.slots .select-slot=(@selected_gun)>
                    for i in [0...state.player.slots]
                        <div .onHand=(state.player.gun == state.player.holsters[i])>
                            "{i + 1}. {((state.player.holsters[i] or {}).name or '')}"
                <div .ui.ammo>
                    <b css:font-size="50px">
                        state.player.gun.ammo
                    " Ammo"
            if state.player.dead
                <div .you-died .fadeIn>
                    "you died"

### css
    .you-died {
        left: 33%
        top: 20%
        font-size: 15vw;
        color: #900;
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
    }

    .ui {
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
        color: white;
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