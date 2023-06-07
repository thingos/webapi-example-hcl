import { useRef } from 'react';
import { AriaTextFieldOptions, useTextField } from 'react-aria';

export function TextField(props: AriaTextFieldOptions<'input'>) {
	let ref = useRef<any>();
	let { labelProps, inputProps } = useTextField(props, ref);

	return (
		<div className="mb-4 items-start">
			<label className="block text-gray-700 text-sm font-bold mb-2 text-left" {...labelProps}>
				{props.label}
			</label>
			<input
				className="bg-gray-200 appearance-none border border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-400 focus:shadow-outline transition ease-in-out duration-150"
				{...inputProps}
			/>
		</div>
	);
}
