class Menu {
    constructor() {
        this.state  = false
        this.toggle = document.querySelector(".menu-icon")
        this.ul     = document.querySelector('.nav__list-item')

        this.open   = this.open.bind(this)
        this.close  = this.close.bind(this)
        this.swap   = this.swap.bind(this)

        this._addEventListeners()
    }

    _addEventListeners() {
        this.toggle.addEventListener('click', this.swap)
    }

    open() {
        document.body.classList.add('nav-active')
        this.state = true
    }

    close() {
        document.body.classList.remove('nav-active')
        this.state = false
    }

    swap() {
        if (this.state == true) this.close()
        else if (this.state == false) this.open()
    }
}

const m = new Menu()

class Parralax {
	constructor() {
		this.els = [...arguments]
		this._addEventListeners()
	}
	append() {
		this.els.append(...arguments)
	}
	_addEventListeners() {
		window.addEventListener("scroll", () => {
			window.requestAnimationFrame(() => {
				this.render(window.scrollY);
			})
		})
	}
	render(y) {
		for (let i = 0; i < this.els.length; i++) {
			const elH = window.getComputedStyle(this.els[i])
			const wH = window.innerHeight
			const elY = this.els[i].scrollTop
			const diff = elY - y;
			const percent = (diff) / wH;
			const f = parseFloat(this.els[i].getAttribute("f"))
			this.els[i].style.transform = `translateY(${percent * 1000 * f}px)`
		}
	}
}

const p = new Parralax(...document.querySelectorAll(".header > *"), ...document.querySelectorAll("section > *"))
