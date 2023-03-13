import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../utils/classNames';
import { RawDetail } from '../utils/uiContext';
import styles from './DetailsView.module.css';
import Divider from './Divider';
import SaveButtons from './SaveButtons';

type Props = {
  id: string;
  title?: string;
  titleAddition?: string;
  state: 'loading' | 'error' | 'success';
  detailForSaving: RawDetail;
  linkTo?: string;
  children: ReactNode;
};

const HeaderWrapper: FC<Pick<Props, 'linkTo' | 'children'>> = ({
  linkTo,
  children,
}) => (linkTo ? <Link to={linkTo}>{children}</Link> : <>{children}</>);

const DetailsView: FC<Props> = ({
  id,
  title,
  titleAddition,
  state,
  detailForSaving,
  linkTo,
  children,
}) => (
  <div className={styles['details-view']}>
    <div className={styles['details-header']}>
      <HeaderWrapper linkTo={linkTo}>
        <div className={styles['details-details']}>
          <h2 className={styles['details-heading']}>{title} </h2>
          <small>{titleAddition}</small>
        </div>
      </HeaderWrapper>
      <div className={styles.buttons}>
        <SaveButtons detail={detailForSaving} />
      </div>
    </div>
    {state === 'loading' ? (
      <div className={cx(styles['details-view'], styles.loading)}>
        Ladataan tietoja (id: {id}) ...
      </div>
    ) : state === 'error' ? (
      <div className={cx(styles['details-view'], styles['error-message'])}>
        Tietoja ei saatu ladattua (id: {id}).
      </div>
    ) : (
      children
    )}
    <Divider />
  </div>
);

export default DetailsView;
