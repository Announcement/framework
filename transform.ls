are-arrays = ->
	return it instanceof Array

to-arrays = ->
	return it if are-arrays it
	return [it]

from-arrays = (previous, current) ->
	previous.concat current

trash = ->
	return it

function flatten
	while it.some are-arrays
		it .= map(to-arrays).reduce(from-arrays)
	it.filter trash

export flatten
