Array.prototype.search = function(key, value) {
	for (let i = 0; i < this.length; i++) {
		if (this[i][key] == value) return i
	}

	return false
}

Number.prototype.pad = function() {
	return this < 10 ? '0' + this : this
}

const chalk = require('chalk'),
	express = require('express'),
	app = express(),
	server = require('http').Server(app),
	io = require('socket.io')(server)

const timestamp = () => {
	const date = new Date()
	return date.getHours().pad() + ':' + date.getMinutes().pad() + ':' + date.getSeconds().pad() + ' '
}

const players = []
let parking = 50

server.listen(80)

app.set('view engine', 'jade')
app.use('/lib', express.static('lib'))

app.get('/play/:username', (req, res) => {
	res.render('play', { username: req.params.username })
})

io.on('connection', socket => {
	socket.on('register', username => {
		const player = players.search('username', username)

		if (Number.isInteger(player)) {
			players[player].id = socket.id
			socket.emit('balance', { balance: players[player].balance })
		} else players.push({ id: socket.id, username: username, balance: 1500 })

		console.log(timestamp() + chalk.magenta('CONNECTION: ') + chalk.gray(username + ' connected'))
		io.emit('update', players)
	})

	socket.on('pay', data => {
		if (Number.isInteger(players.search('id', socket.id))) {
			if (Number.isInteger(data.value) && data.value < 10000) {
				players[players.search('id', socket.id)].balance -= parseInt(data.value)

				if (data.player == 'fine') {
					parking += parseInt(data.value)

					socket.emit('balance', {
						balance: players[players.search('id', socket.id)].balance,
						message: '<i class="fa fa-minus"></i>' + data.value + ' to Free Parking'
					})

					console.log(timestamp() + chalk.yellow('TRANSFER: ') + chalk.gray(
							players[players.search('id', socket.id)].username +
							' paid a £' + data.value + ' fine'
					))
				} else if (data.player == 'bank') {
					socket.emit('balance', {
						balance: players[players.search('id', socket.id)].balance,
						message: '<i class="fa fa-minus"></i>' + data.value + ' to the bank'
					})

					console.log(timestamp() + chalk.yellow('TRANSFER: ') + chalk.gray(
						players[players.search('id', socket.id)].username +
						' paid £' + data.value + ' to the bank'
					))
				} else if (Number.isInteger(players.search('id', data.player))) {
					players[players.search('id', data.player)].balance += parseInt(data.value)

					if (data.player in io.sockets.connected) io.sockets.connected[data.player].emit('balance', {
						balance: players[players.search('id', data.player)].balance,
						message: '<i class="fa fa-plus"></i>' + data.value +' from ' +
							players[players.search('id', socket.id)].username
					})

					socket.emit('balance', {
						balance: players[players.search('id', socket.id)].balance,
						message: '<i class="fa fa-minus"></i>' + data.value + ' to ' +
							players[players.search('id', data.player)].username
					})

					console.log(timestamp() + chalk.yellow('TRANSFER: ') + chalk.gray(
						players[players.search('id', socket.id)].username + ' paid £' +
						data.value + ' to ' + players[players.search('id', data.player)].username
					))
				}
			}
		}
	})

	socket.on('receive', data => {
		if (Number.isInteger(players.search('id', socket.id))) {
			if (Number.isInteger(data.value) && data.value < 10000) {
				players[players.search('id', socket.id)].balance += parseInt(data.value)

				socket.emit('balance', {
					balance: players[players.search('id', socket.id)].balance,
					message: '<i class="fa fa-plus"></i>' + data.value + ' from the bank'
				})

				console.log(timestamp() + chalk.red('ADD: ') + chalk.gray(
					players[players.search('id', socket.id)].username +
					' received £' + data.value
				))
			}
		}
	})

	socket.on('message', command => {
		if (Number.isInteger(players.search('id', socket.id))) {
			if (command == 'go') {
				players[players.search('id', socket.id)].balance += 200

				socket.emit('balance', {
					balance: players[players.search('id', socket.id)].balance,
					message: '<i class="fa fa-plus"></i>200 for passing Go'
				})

				console.log(timestamp() + chalk.green('GO: ') + chalk.gray(
					players[players.search('id', socket.id)].username + ' passed Go'
				))
			} else if (command == 'parking') {
				players[players.search('id', socket.id)].balance += parking

				socket.emit('balance', {
					balance: players[players.search('id', socket.id)].balance,
					message: '<i class="fa fa-plus"></i>' + parking + ' from Free Parking'
				})

				parking = 0

				console.log(timestamp() + chalk.blue('FREE PARKING: ') + chalk.gray(
					players[players.search('id', socket.id)].username + ' collected Free Parking'
				))
			}
		}
	})
})
