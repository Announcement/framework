#>

#> this code is going to be REALLY terrible.

#> equivalent to include + include 2

{flatten} = require 'prelude-ls'

require! <[fs path chalk]>

const folders = /[\/\\]+/g
const pwd = path.parse process.argv.1 .dir

do function initialize
	global.modules = {} unless global.modules?

identify-type-of = (item) ->
	return typeof item unless typeof item is \object
	return if item instanceof Array then 'array' else 'object'

deflate = (point, data, copy?) -> # ripped directly from include1
	unless copy? then
		copy = global.modules

	if typeof point is \string and not point.match folders then
		point = [point]

	if typeof point is \string
		point = point.split folders

	if point.length is 0
		return data

	current = point.shift!
	local = copy.{}[current]


	local = deflate point, data, local

	copy[current] = local
	return copy

function unflatten object
	for own let key, value of object
		deflate key, value

function with-errors array
	array.map (item) ->
		return item.error if item.has-own-property 'error'
	.filter ->
		it

function without-errors array
	array.map (item) ->
		return item unless item.error?
	.filter ->
		it

function clean {array, errors}
	return {
		errors: errors.concat with-errors array
		array: without-errors array
	}

function include ...array # takes standard or listened arguments
	cwd = pwd

	if identify-type-of(array.0) is 'object' then
		cwd := array.shift!dir

	array = flatten [array] # normalize the input
	errors = []

	array .= map ->
		original: it

	array .= map -> # assuming it's local, what would the path be
		it <<< path: path.parse path.join cwd, it.original

	array .= map -> # what do we want to stat
		it <<< stat: it.path.dir

	array .= map -> # attempt to get fs.Stats
		try
			it <<< stats: fs.stat-sync it.stat
		catch error
			{error}

	# capture any errors and remove them from the flow
	{errors, array} = clean {errors, array}

	array .= map ->
		it <<< {is-directory: it.stats.is-directory!} if it.stats

	array .= map -> # read the directory if it's a directory
		if it.is-directory then
			try
				it <<< siblings: fs.readdir-sync it.path.dir
			catch error
				{error}

	{errors, array} = clean {errors, array}

	array .= map -> # is the file in the directory?
		if it.siblings then
			for file in it.siblings
				parsed = path.parse path.join it.path.dir, file
				if parsed.name is it.path.name then
					it <<< {filename: file}
		it

	array .= map ->
		it <<< local: it.siblings? and it.filename?

	array .= map ->
		name = unless it.local then it.original else path.join it.path.dir, it.filename
		{
			it.original
			name
		}

	array .= map ->
		try
			console.log it.name
			it <<< {bin: require(it.name)}
		catch error
			{error}

	{errors, array} = clean {errors, array}

	object = {[..original, ..bin] for array}
	unflatten object

	errors.for-each ->
		console.log chalk.red('Error'), it

	error = "There were issues including " + if errors.length > 1 then "#{errors.length} modules." else "a module."

	throw error if errors.length > 0

	list = [..bin for array]
	return list if list.length is 1 then list.0 else list

module.exports = include
