class GridItems extends P.Group {
	init() {
		this.url = this.group.getAttribute("url")
		this.group.addEventListener("click", e => {
			P.workspace = {
				url: this.url
			}
			P.performTransition("loading", {
				animation: "redirect",
				duration: "500ms"
			})
		})
	}
}
