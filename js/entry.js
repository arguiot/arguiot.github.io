import HorizontalScroll from '@oberon-amsterdam/horizontal';

class Main {
	constructor() {
		this.setupUI()
	}

	setupUI() {
		if (matchMedia) {
			const mq = window.matchMedia("(max-width: 600px)")
			const handler = this.widthChange.bind(this)
			try {
				// Chrome & Firefox
				mq.addEventListener('change', handler);
			} catch (e1) {
				try {
					// Safari
					mq.addListener(handler);
				} catch (e2) {
					console.error(e2);
				}
			}
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