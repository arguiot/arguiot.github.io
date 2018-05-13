class GridItems extends P.Group {
    init() {
        this.url = this.group.getAttribute("url")
        this.group.addEventListener("click", e => {
            P.workspace = {
                url: this.url
            }
            window.location = P.workspace.url
        })
    }
}
