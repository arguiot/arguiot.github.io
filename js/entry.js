import HorizontalScroll from '@oberon-amsterdam/horizontal';

class Main {
	constructor() {
		this.setupUI()
	}

	setupUI() {
		this.horizontal = new HorizontalScroll({
			showScrollbars: true,
		});
	}
}

const m = new Main()
