document.querySelectorAll('.ago').forEach(el => {
	let time = moment(el.innerHTML)
	el.innerHTML = time.fromNow()
})
