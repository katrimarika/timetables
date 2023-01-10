import { ComponentProps, FC } from 'react';
import styles from './Divider.module.css';

const Divider: FC<ComponentProps<'div'>> = (props) => (
  <div className={styles.divider} {...props} />
);

export default Divider;
