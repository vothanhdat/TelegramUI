import styles from './Headline.module.css';
export {styles as HeadlineClasses};


import { classNames } from 'helpers/classNames';

import { Typography, TypographyProps } from '../Typography';

export type HeadlineProps = TypographyProps;

/**
 * The Headline component serves as a wrapper for text that is intended to be displayed prominently,
 * typically used for section headings or important titles within the application. It leverages the Typography
 * component for consistent typographic styling, offering a range of customization options through its props.
 * The component defaults to an `<h5>` HTML tag, providing semantic meaning and ensuring good SEO practices,
 * but can be customized as needed.
 */
export const Headline = ({ className, Component, ...restProps }: HeadlineProps) => (
  <Typography
    {...restProps}
    className={classNames(styles.wrapper, className)}
    Component={Component || 'h5'}
  />
);

