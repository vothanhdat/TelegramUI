import styles from './Ripple.module.css';
export {styles as RippleClasses};


interface Wave {
  x: number;
  y: number;
  date: number;
  pointerId: number;
}

export interface RippleProps {
  clicks: Wave[];
}

export const Ripple = ({ clicks }: RippleProps) => (
  <span
    aria-hidden
    className={styles.wrapper}
  >
    {clicks.map((wave) => (
      <span
        key={wave.date}
        className={styles.wave}
        style={{
          top: wave.y,
          left: wave.x,
        }}
      />
    ))}
  </span>
);
