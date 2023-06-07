import { useRef } from 'react';
import { AriaButtonProps, useButton } from '@react-aria/button';
import { useFocusRing } from '@react-aria/focus';
import { mergeProps } from '@react-aria/utils';
import classNames from 'classnames';

export function Button(props: AriaButtonProps<'button'> & { className?: string }) {
	let ref = useRef<any>();
	let { buttonProps, isPressed } = useButton(props, ref);
	let { focusProps, isFocusVisible } = useFocusRing();
	let className = classNames(
		props.isDisabled ? 'bg-gray-400' : isPressed ? 'bg-yellow-700' : 'bg-yellow-500',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'rounded',
		'cursor-default',

		// Remove the browser default focus ring and add a custom one
		// that only shows up when interacting with a keyboard.
		'focus:outline-none',
		isFocusVisible ? 'shadow-outline' : '',

		'transition',
		'ease-in-out',
		'duration-150',
		props.className != null ? props.className : ''
	);

	return (
		<button {...mergeProps(focusProps, buttonProps)} ref={ref} className={className}>
			{props.children}
		</button>
	);
}
