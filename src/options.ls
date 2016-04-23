require! <[path chalk]>

{flatten} = require 'prelude-ls'

class Command
	argv = []

	regex =
		long: /^\-{2}(\w[\w-]+)$/m
		short: /^\-(\w+)$/m
		indexed: /^(?:-(\w+)|--(\w[\w-]*))\=(.+)/

	regextras =
		no: /^no\-/

	aliases =
		k: 'secure'
		o: 'output'
		a: 'ask'

	function decompose
		it := flatten it
		{[..key, ..value] for it}

	function save-flag key, value=yes
		if value is yes and key.match regextras.no
			key = key.replace regextras.no, ''
			value = no

		if key.length is 1 and aliases.has-own-property key
			key = aliases[key]

		{key, value}

	function handle
		switch it.name
		| \short => [save-flag .. for it.value.1.split('')]
		| \long => [save-flag it.value.1]
		| \indexed => [save-flag(it.value.1 or it.value.2, it.value.3)]

	function provide
		flatten [handle .. for it when ..value?]

	parse = (it) ->
		provide <|
		[{name, value: value.exec it} for own let name, value of regex]

	need: -> # don't forget to update me for the adv.io stream
		return [need .. for arguments] if arguments.length > 1

		missing-flag-error = new Error "Required flag '#{it}' is missing!"

		throw missing-flag-error unless @flags[it]?

	assume: (property, value) ->
		unless @flags[property]?
			@flags[property] = value

	update: ->
		@args = [] ++ argv

		@executable = path.normalize @args.shift!
		@entry = path.normalize @args.shift!

		@flags = decompose [parse .. for @args]
		@parameters = [.. for @args when not ..match /^-/m ]

	add-alias: (short, long) ->
		aliases[short] = long
		@update!

	to-string: ->
		return @executable

	(args) ->
		argv := Array::slice.call args, 0
		@update!

module.exports = new Command(process.argv)
