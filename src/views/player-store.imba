import {state} from '../state'

tag player-store
    def buyGun gun
        if gun.price <= state.player.score
            state.player.score -= gun.price
            var index = state.store.indexOf(gun)
            state.store.splice(index, 1) if (index != -1)
            state.player.inventory.push(gun)

    def upgradeGun gun
        return

    def useGun gun
        return if state.player.holsters.find(do |g| g == gun)
        if state.player.holsters[state.player.slots - 1]
            state.player.holsters.pop()
        state.player.holsters.unshift(gun)

    def render
        if state.player.isInSafeZone()
            <self.ui>
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

### css
    .ui {
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
        color: white;
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

    .store {
        left: 2%;
        top: 2%;
        font-size: 15px;
        margin: 3%;
    }

    .ui {
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
        color: white;
    }


###