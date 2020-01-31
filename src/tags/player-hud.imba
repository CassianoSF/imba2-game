import {state} from '../state'

tag player-hud

    def buyGun gun
        if gun.price <= state.player.score
            state.player.score -= gun.price
            var index = state.store.indexOf(gun)
            state.store.splice(index, 1) if (index != -1)
            state.player.inventory.push(gun)

    def upgradeGun gun
        return

    def useGun gun
        console.log state.player.holsters.map do |g| g.name
        return if state.player.holsters.find(do |g| g == gun)
        if state.player.holsters[state.player.slots - 1]
            state.player.holsters.pop()
        state.player.holsters.unshift(gun)

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
                if state.player.isInSafeZone()
                    <div .ui>
                        <div .store>
                            for gun in state.store
                                <div .buy-row :click.buyGun(gun)>
                                    <div .guns>
                                        "buy {gun.name}"
                                    <div .prices>
                                        gun.price
                            <div .row css:margin-top="5%">
                            for gun in state.player.inventory
                                <div .row>
                                    <div .guns>
                                        gun.name
                                    <div .action :click.useGun(gun)>
                                        "Use"
                                    <div .action :click.upgradeGun(gun)>
                                        "Upgrade"
                    
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
    .store {
        left: 2%;
        top: 2%;
        font-size: 15px;
        margin: 3%;
    }


    .row {
        width: 40%;
        display: flex;
    }

    .buy-row {
        width: 40%;
        display: flex;
    }

    .guns{
        width: 50vw;
    }

    .prices {
        text-align: right;
        flex-grow: 2;
    }

    .action{
        text-align: right;
        flex-grow: 3;
        margin-left: 10%
    }

    .action:hover, .buy-row:hover{
        color: #5F5;
        font-size: 20;
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