import { AnchorHTMLAttributes } from 'react';
import styles from './Link.module.css';
export {styles as LinkClasses};


import { classNames } from 'helpers/classNames';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const Link = ({ className, children, ...restProps }: LinkProps) => (
  <a
    className={classNames(styles.wrapper, className)}
    {...restProps}
  >
    {children}
  </a>
);
