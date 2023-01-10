import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ComponentProps, FC } from 'react';
import { cx } from 'utils/classNames';
import styles from './IconButton.module.css';

const IconButton: FC<ComponentProps<'button'> & { icon: IconProp }> = ({
  icon,
  className,
  children,
  ...rest
}) => (
  <button
    className={cx(
      styles['icon-button'],
      icon === 'times' && styles.close,
      className
    )}
    {...rest}
  >
    <FontAwesomeIcon icon={icon} />
    {children}
  </button>
);

export default IconButton;
