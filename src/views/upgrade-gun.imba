tag upgrade-gun
	def render
		<self>
			<.hud>
				<.upgrades>
					<.gun-name>
						state.shop.upgrade-gun.name
					<.stats-list>
						<stats-item>
							"cap: {state.shop.upgrade-gun.cap}"
						<stats-item>
							"rate: {state.shop.upgrade-gun.rate}"
						<stats-item>
							"spread: {state.shop.upgrade-gun.spread}"
						<stats-item>
							"damage: {state.shop.upgrade-gun.damage}"
						<stats-item>
							"power: {state.shop.upgrade-gun.power}"
						<stats-item>
							"projectiles: {state.shop.upgrade-gun.projectiles}"
						<stats-item>
							"reload_time: {state.shop.upgrade-gun.reload_time}"
						<stats-item>
							"speed: {state.shop.upgrade-gun.speed}"
						<stats-item>
							"penetration: {state.shop.upgrade-gun.penetration}"

						

### css scoped
    .hud {
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
        color: white;
    }

    .upgrade {
    	top: 20%;
    	left: 20%;
    }
###