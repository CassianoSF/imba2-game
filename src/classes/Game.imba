export default global class Game
	def constructor renderer
		renderer = renderer
		current_date = Date.new
		STATE.first_date = Date.new
		STATE.last_date = Date.new
		window.addEventListener('keydown', keydownEvent)
		window.addEventListener('keyup', keyupEvent)
		window.addEventListener('mousemove', mousemoveEvent)
		window.addEventListener('mousedown', mousedownEvent)
		window.addEventListener('mouseup', mouseupEvent)
		setInterval(update.bind(this), 16)

	def update
		current_date = Date.new
		STATE.delta = (current_date - STATE.last_date) / 5
		STATE.time = current_date - STATE.first_date
		STATE.last_date = current_date
		STATE.player.update()




		for bullet of STATE.bullets
			bullet.update() if bullet

		for zombie of STATE.player.nearZombies
			zombie.update() if zombie

		for zombie of STATE.killed
			zombie.update() if zombie

		renderer.render()

	def keydownEvent e
		STATE.player.onKeyEvent(e.code)
		STATE.keys[e.code] = true

	def keyupEvent e
		STATE.keys[e.code] = false

	def mousemoveEvent e
		STATE.mouse.x = e.clientX
		STATE.mouse.y = window.innerHeight - e.clientY

	def mousedownEvent e
		STATE.mouse.press = true

	def mouseupEvent e
		STATE.mouse.press = false