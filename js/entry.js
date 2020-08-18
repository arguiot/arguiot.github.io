import HorizontalScroll from '@oberon-amsterdam/horizontal';

class Main {
	constructor() {
		this.setupUI()
	}

	setupUI() {
		if (matchMedia) {
			const mq = window.matchMedia("(max-width: 600px)")
			mq.addListener(this.widthChange.bind(this))
			this.widthChange(mq)
		} else {
			this.largeWindow()
		}
	}

	widthChange(mq) {
		if (mq.matches) {
			this.smallWindow()
		} else {
			this.largeWindow()
		}
	}
	smallWindow() {
		if (typeof this.horizontal != "undefined") {
			this.horizontal.destroy()
		}
	}

	largeWindow() {
		this.horizontal = new HorizontalScroll({
			showScrollbars: true,
		});
	}
}

const m = new Main()

export default m