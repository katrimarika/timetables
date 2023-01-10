import { ComponentProps, FC } from 'react';
import styles from './Divider.module.css';

export const Divider: FC<ComponentProps<'div'>> = (props) => (
  <div className={styles.divider} {...props} />
);
