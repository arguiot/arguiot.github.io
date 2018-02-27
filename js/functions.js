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
