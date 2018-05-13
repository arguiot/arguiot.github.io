const P = new ProType();

class MainView extends P.ViewController {
    willShow() {
        const left = this.view.querySelector(".shooting-star")
        const right = this.view.querySelector(".shooting-star-right")
        this.shooting(left, "left")
        this.shooting(right, "right")

		this.projects = this.mountGroups(
			this.view.querySelectorAll(".grid > .item"),
			Projects
		)
		this.age()
		this.location()
    }
    shooting(el, dir) {
        setInterval(() => {
            let topPos = Math.floor(Math.random() * 80) + 1;
            topPos = `${topPos}%`;
            let leftPos = Math.floor(Math.random() * 40) + 1;
            leftPos = `${leftPos}%`;
            let trans = Math.floor(Math.random() * 300) + 1;
            trans = `${trans}deg`;
			el.style.top = topPos
			el.style[dir] = leftPos
			el.style.transform = `rotate(${trans})`
        }, 2000);
    }
	age() {
		const oneYear = 60 * 60 * 24 * 365.25
		const now = new Date();
    	const birthday = new Date(`May 22 2002`);

    	const diff = now.getTime() - birthday.getTime()
		const year = diff / oneYear
		const age = year / 1000
		this.view.querySelector("span.age").innerHTML = Math.floor(age)
	}
	location() {
		fetch("https://api.github.com/users/arguiot").then(data => data.json()).then(data => {
			this.view.querySelector("span.location").innerHTML = data.location
		})
	}
}

P.autoMount(MainView)

P.set("main")
