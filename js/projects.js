class Projects extends P.Group {
	init() {
		this.url = this.group.getAttribute("url")
		this.group.addEventListener("click", e => {
			window.location = this.url
		})
	}
}
