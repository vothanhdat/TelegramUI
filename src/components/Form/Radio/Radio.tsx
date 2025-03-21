import { forwardRef, InputHTMLAttributes } from 'react';
import styles from './Radio.module.css';
export {styles as RadioClasses};


import { classNames } from 'helpers/classNames';

import { VisuallyHidden } from 'components/Service/VisuallyHidden/VisuallyHidden';
import { IconRadio } from './icons/radio';
import { IconRadioChecked } from './icons/radio_checked';

export interface RadioProps
  extends InputHTMLAttributes<HTMLInputElement> {
}

/**
 * Renders a custom radio button, visually hiding the actual input while displaying custom icons for unchecked and checked states.
 * It supports all standard properties and events of an HTML input element of type "radio".
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  style,
  className,
  disabled,
  ...restProps
}, ref) => (
  <label
    className={classNames(
      styles.wrapper,
      disabled && styles['wrapper--disabled'],
      className,
    )}
  >
    <VisuallyHidden
      {...restProps}
      Component="input"
      type="radio"
      className={styles.input}
      disabled={disabled}
      ref={ref}
    />
    <IconRadio className={styles.icon} aria-hidden />
    <IconRadioChecked className={styles.checkedIcon} aria-hidden />
  </label>
));
