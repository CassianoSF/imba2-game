import {state} from '../state'

tag player-store
    def buyGun gun
        return unless state.player.inSafeZone()
        if gun.price <= state.player.score
            state.player.score -= gun.price
            var index = state.store.indexOf(gun)
            state.store.splice(index, 1) if (index != -1)
            state.player.inventory.push(gun)

    def upgradeGun gun
        return unless state.player.inSafeZone()

    def equipGun gun
        return unless state.player.inSafeZone()
        state.player.equip(gun)

    def render
        <self.hud.score .{state.player.inSafeZone() ? "fadeIn" : "fadeOut"}>
            <.store>
                <.buy-row>
                    <.item>
                        "Item"
                    <.prices>
                        "price"
                <.buy-row>
                    <.item>
                        "Restore health"
                    <.prices>
                        "2000"
                <.buy-row>
                    <.item>
                        "Increse health"
                    <.prices>
                        "2000"
                <.buy-row>
                    <.item>
                        "Increse speed"
                    <.prices>
                        "2000"
                <.buy-row>
                    <.item>
                        "Increse stamina"
                    <.prices>
                        "2000"
                <.row css:margin-top="5%">
                for gun in state.store
                    <.buy-row :click.buyGun(gun)>
                        <.item>
                            "buy {gun.name}"
                        <.prices>
                            gun.price
                <.row css:margin-top="5%">
                for gun in state.player.inventory
                    <.row>
                        <.item>
                            gun.name
                        <.action :click.equipGun(gun)>
                            "Equip"
                        <.action :click.upgradeGun(gun)>
                            "Upgrade"
                <.row css:margin-top="5%">
                <.buy-row>
                    <.next-day>
                        "Go to next day"
### css scoped
    .hud {
        position: fixed;
        z-index: 1;
        font-family: Typewriter;
        color: white;
        background-color: rgba(0,0,0,0.9);
        border-color: white;
        border: 1px;
        cursor: pointer;
    }

    .row {
        display: flex;
    }

    .buy-row {
        display: flex;
    }

    .item, .next-day{
        width: 25vw;
    }

    .prices {
        text-align: right;
        flex-grow: 2;
    }

    .action{
        text-align: right;
        width: 12vw
    }

    .buy-row:hover{
        color: #5F5;
        text-shadow: 2px 2px #A00;
        .prices {
            transform: translate(-2vw,0) scale(1.3,1.3);
        }
    }
    .action:hover{
        text-shadow: 2px 2px #A00;
        color: #5F5;
        transform: scale(1.3,1.3);
    }
    .next-day:hover {
        text-shadow: 2px 2px #A00;
        color: #5F5;
        transform: scale(1.3,1.3) translate(3.2vw,0)
    }

    .store {
        font-size: 1.5vw;
        margin: 3%;
    }

###