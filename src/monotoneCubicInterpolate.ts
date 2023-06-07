/*
 * See https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
 */
export function createInterpolant(xs: number[], ys: number[]) {
	let i = xs.length;
	// Deal with length issues
	if (xs.length != ys.length) {
		throw 'Need an equal count of xs and ys.';
	}
	if (xs.length === 0) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		return function () {
			return 0;
		};
	}
	if (xs.length === 1) {
		// Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
		// Impl: Unary plus properly converts values to numbers
		const result = +ys[0];
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		return function () {
			return result;
		};
	}

	// Rearrange xs and ys so that xs is sorted
	const indexes = [];
	for (i = 0; i < xs.length; i++) {
		indexes.push(i);
	}
	indexes.sort(function (a, b) {
		return xs[a] < xs[b] ? -1 : 1;
	});
	const oldXs = xs,
		oldYs = ys;
	// Impl: Creating new arrays also prevents problems if the input arrays are mutated later
	const xsNew: number[] = [];
	const ysNew: number[] = [];
	// Impl: Unary plus properly converts values to numbers
	for (i = 0; i < xs.length; i++) {
		xsNew[i] = +oldXs[indexes[i]];
		ysNew[i] = +oldYs[indexes[i]];
	}

	// Get consecutive differences and slopes
	const dys = [],
		dxs = [],
		ms = [];
	for (i = 0; i < xs.length - 1; i++) {
		const dx = xsNew[i + 1] - xsNew[i],
			dy = ysNew[i + 1] - ysNew[i];
		dxs[i] = dx;
		dys[i] = dy;
		ms[i] = dy / dx;
	}
	// Get degree-1 coefficients
	const c1s = [ms[0]];
	for (i = 0; i < dxs.length - 1; i++) {
		const m = ms[i],
			mNext = ms[i + 1];
		if (m * mNext <= 0) {
			c1s[i] = 0;
		} else {
			const dx_ = dxs[i],
				dxNext = dxs[i + 1],
				common = dx_ + dxNext;
			c1s[i] = (3 * common) / ((common + dxNext) / m + (common + dx_) / mNext);
		}
	}
	c1s.push(ms[ms.length - 1]);

	// Get degree-2 and degree-3 coefficients
	const c2s: number[] = [];
	const c3s: number[] = [];
	for (i = 0; i < c1s.length - 1; i++) {
		const c1 = c1s[i];
		const m_ = ms[i];
		const invDx = 1 / dxs[i];
		const common_ = c1 + c1s[i + 1] - m_ - m_;
		c2s[i] = (m_ - c1 - common_) * invDx;
		c3s[i] = common_ * invDx * invDx;
	}

	// Return interpolant function
	return function (x: number) {
		// The rightmost point in the dataset should give an exact result
		let i = xsNew.length - 1;
		if (x == xsNew[i]) {
			return ys[i];
		}

		// Search for the interval x is in, returning the corresponding y if x is one of the original xs
		let low = 0,
			mid,
			high = c3s.length - 1;
		while (low <= high) {
			mid = Math.floor(0.5 * (low + high));
			const xHere = xsNew[mid];
			if (xHere < x) {
				low = mid + 1;
			} else if (xHere > x) {
				high = mid - 1;
			} else {
				// Uncomment the following to return only the interpolated value.
				return ys[mid];
				low = c3s.length - 1;
				high = mid;
				break;
			}
		}
		i = Math.max(0, high);

		// Interpolate
		const diff = x - xsNew[i];
		const interpolatedValue = ys[i] + diff * (c1s[i] + diff * (c2s[i] + diff * c3s[i]));
		return interpolatedValue;
	};
}
