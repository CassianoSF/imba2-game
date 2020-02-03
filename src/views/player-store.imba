import {Zombie} from '../classes/Zombie'
import {state} from '../state'

tag player-store

    def buyGun gun
        if gun.price <= state.player.score
            state.player.score -= gun.price
            var index = state.store.indexOf(gun)
            state.store.splice(index, 1) if (index != -1)
            state.player.inventory.push(gun)

    def upgradeGun gun
        state.shop.upgrade-gun = gun

    def equipGun gun
        state.player.equip(gun)

    def toggleShop
        if state.player.inSafeZone()
            state.shop.open = not state.shop.open

    def nextDay
        state.day++
        for own key, sector of state.sector
            sector.clear()

        for i in [0..(5000 + 1000 * (state.day ** 1.4))]
            let zombie = Zombie.new(state.player, state.day)
            state.sector[zombie.currentSector()] ||= Set.new
            state.sector[zombie.currentSector()].add(zombie)

        state.shop.open = no


    def healPlayer
        state.player.score -= state.day * 40
        state.player.life = state.player.max-life

    def buyAmmo
        state.player.score -= state.day * 200
        state.player.life = state.player.max-life

    def upgradeHealth
        state.player.score -= state.shop.health
        state.player.max-life += 10 
        state.shop.health *= 2

    def upgradeSpeed
        state.player.score -= state.shop.speed
        state.player.speed += 0.05
        state.shop.speed *= 2

    def upgradeStamina
        state.player.score -= state.shop.stamina
        state.player.stamina += 10 
        state.shop.stamina *= 10 

    def upgradeHolster
        state.player.score -= state.shop.slots
        state.player.slots += 1
        state.shop.slots *= 2

    def render
        <self.hud.score .{state.player.inSafeZone() ? "fadeIn" : "fadeOut"}>
            <upgrade-gun> if state.shop.upgrade-gun
            if not state.shop.open
                <.open-store>
                    <.buy-row :click.toggleShop>
                        <.item>
                            "Open shop"
            else
                <.store>
                    <h1>
                        "SHOP"
                    <.buy-row>
                        <.item>
                            "Item"
                        <.prices>
                            "price"
                    <.row css:margin-top="5%">
                    <.buy-row :click.healPlayer>
                        <.item>
                            "Heal"
                        <.prices>
                            state.day * 40
                    <.buy-row :click.buyAmmo>
                        <.item>
                            "Buy Ammo"
                        <.prices>
                            state.day * 200
                    <.row css:margin-top="5%">
                    <.buy-row :click.upgradeHealth>
                        <.item>
                            "Upgrade health"
                        <.prices>
                            state.shop.health
                    <.buy-row :click.upgradeSpeed>
                        <.item>
                            "Upgrade speed"
                        <.prices>
                            state.shop.speed
                    <.buy-row :click.upgradeStamina>
                        <.item>
                            "Upgrade stamina"
                        <.prices>
                            state.shop.stamina
                    if state.player.slots < 6
                        <.buy-row :click.upgradeHolster>
                            <.item>
                                "Upgrade holster"
                            <.prices>
                                "{state.shop.slots}"
                    <.row css:margin-top="5%">
                    for gun in state.store
                        <.buy-row :click.buyGun(gun)>
                            <.item>
                                "buy {gun.name}"
                            <.prices>
                                gun.price
                    <.row css:margin-top="5%">

                    <h1>
                        "INVERTORY"
                    for gun in state.player.inventory
                        <.row>
                            <.item>
                                gun.name
                            <.action :click.equipGun(gun)>
                                "Equip"
                            <.action :click.upgradeGun(gun)>
                                "Upgrade"
                    <.row css:margin-top="5%">
                    <.row>
                        <.next-day :click.nextDay>
                            "Go to next day"
                        <.close :click.toggleShop>
                            "Close"
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
        top: 10%;
        left: 50%;
        transform: translate(-50%,0);
    }

    .row, .buy-row {
        display: flex;
    }

    .item, .next-day{
        width: 300px;
    }

    .prices, .close {
        text-align: right;
        flex-grow: 1;
    }

    .action{
        text-align: right;
        width: 6vw
    }

    .buy-row:hover{
        color: #5F5;
        text-shadow: 2px 2px #A00;
        .prices {
            transform: translate(-1vw,0) scale(1.3,1.3);
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
        transform: scale(1.3,1.3) translate(1vw,0)
    }
    .close:hover {
        text-shadow: 2px 2px #A00;
        color: #5F5;
        transform: scale(1.3,1.3) translate(-1vw,0)
    }

    .store {
        font-size: calc(10px + .6vw);
    }
    .open-store {
        font-size: calc(15px + .8vw);
    }

    .open-store {
        text-align: center
    }

###